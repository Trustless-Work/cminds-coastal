import { http } from "@repo/config";

export type CreateEscrowMilestonePayload = {
  task_id: string;
  milestone_index: number;
  amount: number;
  deadline?: string;
  custom_description?: string;
};

export type CreateEscrowPayload = {
  escrow_id: string;
  title: string;
  community_name: string;
  description: string;
  geographic_area?: string;
  image_url?: string;
  engagement_id: string;
  approver_user_id: string;
  release_signer_user_id: string;
  milestones: CreateEscrowMilestonePayload[];
};

export type EscrowTask = {
  task_id: string;
  code: string;
  category: string;
  name: string;
  expected_deliverable: string;
};

export type EscrowMilestoneRecord = {
  escrow_milestone_id: string;
  escrow_id: string;
  task_id: string;
  milestone_index: number;
  amount: string;
  deadline: string | null;
  custom_description: string | null;
  task: EscrowTask;
};

export type EscrowRecord = {
  escrow_id: string;
  title: string;
  community_name: string;
  description: string;
  geographic_area: string | null;
  image_url: string | null;
  status: string;
  engagement_id: string;
  initializer_user_id: string;
  approver_user_id: string | null;
  release_signer_user_id: string | null;
  created_at: string;
  updated_at: string;
  milestones: EscrowMilestoneRecord[];
};

export type UploadEscrowImageResult = {
  image_url: string;
  storage_path: string;
};

export async function uploadEscrowImage(
  file: File,
): Promise<UploadEscrowImageResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await http.post<UploadEscrowImageResult>(
    "/escrows/upload-image",
    formData,
  );
  return data;
}

export async function createEscrow(
  payload: CreateEscrowPayload,
): Promise<EscrowRecord> {
  const { data } = await http.post<EscrowRecord>("/escrows", payload);
  return data;
}

export async function fetchMyEscrows(): Promise<EscrowRecord[]> {
  const { data } = await http.get<EscrowRecord[]>("/escrows/mine");
  return data;
}

export async function fetchEscrow(escrowId: string): Promise<EscrowRecord> {
  const { data } = await http.get<EscrowRecord>(
    `/escrows/${encodeURIComponent(escrowId)}`,
  );
  return data;
}

/** Public funding catalog — cursor-paginated, no auth required. */
export type FundingEscrowsQuery = {
  limit?: number;
  cursor?: string;
  status?: string;
  community?: string;
  q?: string;
};

export type FundingEscrowsPage = {
  items: EscrowRecord[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type FundingEscrowFacets = {
  statuses: string[];
  communities: string[];
};

export async function fetchFundingEscrowsPage(
  params: FundingEscrowsQuery = {},
): Promise<FundingEscrowsPage> {
  const { data } = await http.get<FundingEscrowsPage>("/escrows/funding", {
    params: {
      ...(params.limit !== undefined ? { limit: params.limit } : {}),
      ...(params.cursor ? { cursor: params.cursor } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.community ? { community: params.community } : {}),
      ...(params.q ? { q: params.q } : {}),
    },
  });
  return data;
}

/** Filter dropdown options for the public funding catalog. */
export async function fetchFundingEscrowFacets(): Promise<FundingEscrowFacets> {
  const { data } = await http.get<FundingEscrowFacets>(
    "/escrows/funding/facets",
  );
  return data;
}

/** Public escrow by contract ID — no auth required. */
export async function fetchFundingEscrow(
  contractId: string,
): Promise<EscrowRecord> {
  const { data } = await http.get<EscrowRecord>(
    `/escrows/funding/${encodeURIComponent(contractId)}`,
  );
  return data;
}
