import type { EscrowRecord } from "../services/escrows.service";
import type { EscrowListFilters } from "../hooks/useFundingEscrowsInfinite";

/**
 * Client-side filter for participating escrow lists (community / CMinds).
 */
export function filterEscrowRecords(
  escrows: EscrowRecord[],
  filters: EscrowListFilters,
): EscrowRecord[] {
  const status = filters.status.trim().toUpperCase();
  const query = filters.query.trim().toLowerCase();
  const community = filters.community.trim();

  return escrows.filter((escrow) => {
    if (status && escrow.status.toUpperCase() !== status) {
      return false;
    }
    if (community && escrow.community_id !== community) {
      return false;
    }
    if (query) {
      const haystack = [
        escrow.title,
        escrow.description,
        escrow.engagement_id,
        escrow.community?.name ?? "",
        escrow.geographic_area ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}
