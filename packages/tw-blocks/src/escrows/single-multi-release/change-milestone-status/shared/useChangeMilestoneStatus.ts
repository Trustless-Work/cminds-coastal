import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  encodeEvidenceRefs,
  MAX_EVIDENCE_FILES,
  MAX_EVIDENCE_URLS,
  type EncodedEvidenceRef,
} from "@repo/helpers";
import {
  registerEvidenceUrl,
  uploadEvidenceFile,
} from "@repo/features/escrow/services/evidence.service";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { ChangeMilestoneStatusPayload } from "@trustless-work/escrow";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";
import {
  changeMilestoneStatusSchema,
  type ChangeMilestoneStatusValues,
} from "./schema";

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,text/plain";

export function useChangeMilestoneStatus({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const { changeMilestoneStatus } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<ChangeMilestoneStatusValues>({
    resolver: zodResolver(changeMilestoneStatusSchema),
    defaultValues: {
      milestoneIndex: "0",
      status: "",
      evidenceUrls: [],
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(
    null,
  );
  const [urlDraft, setUrlDraft] = React.useState("");

  function addFiles(incoming: FileList | File[]): void {
    const next = [...files, ...Array.from(incoming)];
    if (next.length > MAX_EVIDENCE_FILES) {
      toastError(
        "Too Many Files",
        `Maximum ${MAX_EVIDENCE_FILES} files allowed.`,
      );
      setFiles(next.slice(0, MAX_EVIDENCE_FILES));
      return;
    }
    setFiles(next);
  }

  function removeFile(index: number): void {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function addUrl(): void {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    const current = form.getValues("evidenceUrls") ?? [];
    if (current.length >= MAX_EVIDENCE_URLS) {
      toastError("Too Many URLs", `Maximum ${MAX_EVIDENCE_URLS} URLs allowed.`);
      return;
    }
    try {
      // Validate URL shape before adding
      // eslint-disable-next-line no-new
      new URL(trimmed);
    } catch {
      toastError("Invalid URL", "Enter a valid http(s) URL.");
      return;
    }
    form.setValue("evidenceUrls", [...current, trimmed], {
      shouldValidate: true,
    });
    setUrlDraft("");
  }

  function removeUrl(index: number): void {
    const current = form.getValues("evidenceUrls") ?? [];
    form.setValue(
      "evidenceUrls",
      current.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      const milestone =
        selectedEscrow?.milestones?.[Number(payload.milestoneIndex)];
      const flags =
        milestone && "flags" in milestone
          ? (milestone as MultiReleaseMilestone).flags
          : undefined;

      if (flags?.released) {
        toastError(
          "Status Locked",
          "This milestone was already released. Status can no longer be updated.",
        );
        return;
      }

      const refs: EncodedEvidenceRef[] = [];
      const contractId = selectedEscrow?.contractId || "";
      const milestoneIndex = Number(payload.milestoneIndex);

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        if (!file) continue;
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})…`);
        const uploaded = await uploadEvidenceFile(file, {
          escrowId: contractId,
          milestoneIndex,
        });
        refs.push({ kind: "file", id: uploaded.id });
      }

      const urls = payload.evidenceUrls ?? [];
      for (let i = 0; i < urls.length; i += 1) {
        const url = urls[i];
        if (!url) continue;
        setUploadProgress(`Registering URL (${i + 1}/${urls.length})…`);
        const registered = await registerEvidenceUrl({
          url,
          escrowId: contractId,
          milestoneIndex,
        });
        refs.push({ kind: "url", id: registered.id });
      }

      setUploadProgress(null);

      let encodedEvidence: string | undefined;
      if (refs.length > 0) {
        encodedEvidence = encodeEvidenceRefs(refs);
      }

      const finalPayload: ChangeMilestoneStatusPayload = {
        contractId,
        milestoneIndex: payload.milestoneIndex,
        newStatus: payload.status,
        newEvidence: encodedEvidence,
        serviceProvider: walletAddress || "",
      };

      await changeMilestoneStatus.mutateAsync({
        payload: finalPayload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Task Status Updated",
        "The milestone status was saved on-chain.",
      );

      onSuccess?.();

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((m, index) => {
          if (index === Number(payload.milestoneIndex)) {
            return {
              ...m,
              status: payload.status,
              evidence: encodedEvidence,
            };
          }
          return m;
        }),
      });

      setFiles([]);
      setUrlDraft("");
      form.reset();
    } catch (error) {
      const message =
        handleError(error as ErrorResponse).message ||
        (error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.");
      toastError("Status Update Failed", message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  });

  return {
    form,
    handleSubmit,
    isSubmitting,
    files,
    addFiles,
    removeFile,
    urlDraft,
    setUrlDraft,
    addUrl,
    removeUrl,
    uploadProgress,
    acceptedFileTypes: ACCEPTED_FILE_TYPES,
    maxFiles: MAX_EVIDENCE_FILES,
    maxUrls: MAX_EVIDENCE_URLS,
  };
}
