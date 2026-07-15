export type PageSlot = number | "ellipsis";

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): PageSlot[] {
  if (totalPages <= 0) {
    return [];
  }
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  for (const delta of [-1, 1]) {
    const neighbor = currentPage + delta;
    if (neighbor >= 1 && neighbor <= totalPages) {
      pages.add(neighbor);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: PageSlot[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index]!;
    const prev = sorted[index - 1];
    if (prev !== undefined && page - prev > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }

  return result;
}
