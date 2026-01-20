export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends PaginationInfo {
  data: T[];
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | "ellipsis")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: (number | "ellipsis")[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  range.push(1);

  // Calculate start and end of visible range
  let start = Math.max(2, currentPage - halfVisible);
  let end = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if we're near the beginning
  if (currentPage <= halfVisible + 1) {
    end = Math.min(totalPages - 1, maxVisible - 1);
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    start = Math.max(2, totalPages - maxVisible + 2);
  }

  // Add ellipsis after first page if needed
  if (start > 2) {
    range.push("ellipsis");
  }

  // Add visible pages
  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  // Add ellipsis before last page if needed
  if (end < totalPages - 1) {
    range.push("ellipsis");
  }

  // Always show last page
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

export function getPageInfo(pagination: PaginationInfo): string {
  const { page, limit, total } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (total === 0) {
    return "無資料";
  }

  return `顯示 ${start}-${end} 筆，共 ${total} 筆`;
}

export function canGoNext(pagination: PaginationInfo): boolean {
  return pagination.page < pagination.totalPages;
}

export function canGoPrev(pagination: PaginationInfo): boolean {
  return pagination.page > 1;
}
