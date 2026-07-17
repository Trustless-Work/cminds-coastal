import { http } from "@repo/config";

export type EvidenceRefRecord = {
  id: string;
  kind: "file" | "url";
  url: string;
  filename: string | null;
  mime_type: string | null;
  escrow_id: string | null;
  milestone_index: number | null;
  created_at: string;
};

export async function uploadEvidenceFile(
  file: File,
  meta?: { escrowId?: string; milestoneIndex?: number },
): Promise<EvidenceRefRecord> {
  const formData = new FormData();
  formData.append("file", file);
  if (meta?.escrowId) formData.append("escrow_id", meta.escrowId);
  if (meta?.milestoneIndex !== undefined) {
    formData.append("milestone_index", String(meta.milestoneIndex));
  }
  const { data } = await http.post<EvidenceRefRecord>(
    "/evidence/upload",
    formData,
  );
  return data;
}

export async function registerEvidenceUrl(payload: {
  url: string;
  escrowId?: string;
  milestoneIndex?: number;
}): Promise<EvidenceRefRecord> {
  const { data } = await http.post<EvidenceRefRecord>("/evidence/register-url", {
    url: payload.url,
    escrow_id: payload.escrowId,
    milestone_index: payload.milestoneIndex,
  });
  return data;
}

export async function resolveEvidenceRefs(
  ids: string[],
): Promise<EvidenceRefRecord[]> {
  if (ids.length === 0) return [];
  const { data } = await http.get<EvidenceRefRecord[]>("/evidence/resolve", {
    params: { ids: ids.join(",") },
  });
  return data;
}
