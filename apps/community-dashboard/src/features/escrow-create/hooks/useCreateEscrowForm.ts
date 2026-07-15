"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { networkConfig } from "@repo/config";
import { createEscrow, uploadEscrowImage } from "@repo/features/escrow/services/escrows.service";
import type { UserSearchResult } from "@repo/features/auth/services/users-search.service";
import { buildEscrow } from "@repo/helpers";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { useEscrowsMutations } from "@repo/tw-blocks/tanstack/useEscrowsMutations";
import type { InitializeMultiReleaseEscrowPayload } from "@trustless-work/escrow/types";

import {
  createDefaultReceiver,
  createEscrowSchema,
  type CreateEscrowFormValues,
  type TaskReceiverValue,
} from "../schemas/create-escrow.schema";
import { useTasks } from "./useTasks";

export function useCreateEscrowForm() {
  const router = useRouter();
  const { walletAddress } = useWalletContext();
  const { setSelectedEscrow } = useEscrowContext();
  const { deployEscrow } = useEscrowsMutations();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const [cmindsUser, setCmindsUser] = useState<UserSearchResult | null>(null);
  const [releaseSigner, setReleaseSigner] =
    useState<UserSearchResult | null>(null);
  const [receiverUsers, setReceiverUsers] = useState<
    Record<string, UserSearchResult | null>
  >({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateEscrowFormValues>({
    resolver: zodResolver(createEscrowSchema),
    defaultValues: {
      title: "",
      communityName: "",
      description: "",
      geographicArea: "",
      engagementId: "",
      cmindsUserId: "",
      cmindsWalletAddress: "",
      releaseSignerUserId: "",
      releaseSignerWalletAddress: "",
      selectedTaskIds: [],
      amounts: {},
      receivers: {},
      customDescription: "",
    },
  });

  useEffect(() => {
    form.register("selectedTaskIds");
    form.register("amounts");
    form.register("receivers");
    form.register("customDescription");
  }, [form]);

  const selectedTaskIds = useWatch({
    control: form.control,
    name: "selectedTaskIds",
    defaultValue: [],
  });
  const amounts = useWatch({
    control: form.control,
    name: "amounts",
    defaultValue: {},
  });
  const receivers = useWatch({
    control: form.control,
    name: "receivers",
    defaultValue: {},
  });
  const customDescription = useWatch({
    control: form.control,
    name: "customDescription",
    defaultValue: "",
  });

  function selectCminds(user: UserSearchResult | null) {
    setCmindsUser(user);
    form.setValue("cmindsUserId", user?.user_id ?? "", { shouldValidate: true });
    form.setValue("cmindsWalletAddress", user?.wallet_address ?? "", {
      shouldValidate: true,
    });
  }

  function selectReleaseSigner(user: UserSearchResult | null) {
    setReleaseSigner(user);
    form.setValue("releaseSignerUserId", user?.user_id ?? "", {
      shouldValidate: true,
    });
    form.setValue("releaseSignerWalletAddress", user?.wallet_address ?? "", {
      shouldValidate: true,
    });
  }

  function toggleTask(taskId: string) {
    const current = form.getValues("selectedTaskIds") ?? [];
    const isSelected = current.includes(taskId);
    const next = isSelected
      ? current.filter((id) => id !== taskId)
      : [...current, taskId];
    form.setValue("selectedTaskIds", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const nextReceivers = { ...form.getValues("receivers") };
    const nextAmounts = { ...form.getValues("amounts") };
    if (isSelected) {
      delete nextReceivers[taskId];
      delete nextAmounts[taskId];
      setReceiverUsers((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
    } else {
      nextReceivers[taskId] = createDefaultReceiver();
    }
    form.setValue("receivers", nextReceivers, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("amounts", nextAmounts, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setTaskAmount(taskId: string, value: string) {
    form.setValue(`amounts.${taskId}`, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function setTaskReceiver(taskId: string, value: TaskReceiverValue) {
    form.setValue(`receivers.${taskId}`, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function setTaskReceiverUser(
    taskId: string,
    user: UserSearchResult | null,
  ) {
    setReceiverUsers((prev) => ({ ...prev, [taskId]: user }));
  }

  function setCustomDescription(value: string) {
    form.setValue("customDescription", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function setEscrowImage(file: File | null) {
    setImageFile(file);
    setImageError(undefined);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!walletAddress) {
      toastError(
        "Wallet Required",
        "Connect your Pollar wallet to initialize an escrow.",
      );
      return;
    }

    if (!imageFile) {
      setImageError("Add an escrow image");
      toastError(
        "Image Required",
        "Add an escrow cover image before initializing.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const selectedTasks = values.selectedTaskIds.map((taskId) => {
        const task = tasks.find((item) => item.task_id === taskId);
        if (!task) {
          throw new Error("Selected task not found");
        }
        const receiver = values.receivers[taskId];
        if (!receiver?.walletAddress) {
          throw new Error(`Receiver is required for ${task.code}`);
        }
        return {
          taskId: task.task_id,
          code: task.code,
          name: task.name,
          amount: Number(values.amounts[taskId]),
          receiverWalletAddress: receiver.walletAddress,
          customDescription:
            task.code === "X-01" ? values.customDescription : undefined,
        };
      });

      const payload = buildEscrow({
        title: values.title,
        description: values.description,
        engagementId: values.engagementId,
        signerAddress: walletAddress,
        cmindsWalletAddress: values.cmindsWalletAddress,
        releaseSignerWalletAddress: values.releaseSignerWalletAddress,
        selectedTasks: selectedTasks.map(
          ({ code, name, amount, customDescription, receiverWalletAddress }) => ({
            code,
            name,
            amount,
            customDescription,
            receiverWalletAddress,
          }),
        ),
        trustline: {
          address: networkConfig.usdcIssuer,
          symbol: "USDC",
        },
      }) as InitializeMultiReleaseEscrowPayload;

      const response = await deployEscrow.mutateAsync({
        payload,
        type: "multi-release",
        address: walletAddress,
      });

      const contractId = response.contractId;
      if (!contractId) {
        throw new Error(
          "Missing contract id after sending the initialize transaction",
        );
      }

      setSelectedEscrow({ ...payload, contractId });

      const { image_url } = await uploadEscrowImage(imageFile);

      await createEscrow({
        escrow_id: contractId,
        title: values.title,
        community_name: values.communityName,
        description: values.description,
        geographic_area: values.geographicArea || undefined,
        image_url,
        engagement_id: values.engagementId,
        approver_user_id: values.cmindsUserId,
        release_signer_user_id: values.releaseSignerUserId,
        milestones: selectedTasks.map((task, index) => ({
          task_id: task.taskId,
          milestone_index: index,
          amount: task.amount,
          custom_description: task.customDescription,
        })),
      });

      toastSuccess(
        "Escrow Initialized",
        "Your escrow is live and ready to receive USDC funding.",
      );
      router.push(`/dashboard/escrows/${contractId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize escrow";
      toastError(
        "Initialization Failed",
        message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    tasks,
    tasksLoading,
    cmindsUser,
    releaseSigner,
    selectCminds,
    selectReleaseSigner,
    selectedTaskIds,
    amounts,
    receivers,
    receiverUsers,
    customDescription,
    imageFile,
    imageError,
    setEscrowImage,
    toggleTask,
    setTaskAmount,
    setTaskReceiver,
    setTaskReceiverUser,
    setCustomDescription,
    onSubmit,
    isSubmitting,
    walletAddress,
  };
}
