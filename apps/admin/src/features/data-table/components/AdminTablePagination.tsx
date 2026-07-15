"use client";

import { Button } from "@repo/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@repo/ui/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  ADMIN_PAGE_SIZE_OPTIONS,
  type AdminPageSize,
  type AdminPaginationMeta,
  type AdminPaginationState,
} from "../types";
import { getPageNumbers } from "../utils/page-numbers";

type AdminTablePaginationProps = {
  pagination: AdminPaginationState;
  meta: AdminPaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: AdminPageSize) => void;
};

export const AdminTablePagination = ({
  pagination,
  meta,
  onPageChange,
  onPageSizeChange,
}: AdminTablePaginationProps) => {
  const { page, pageSize } = pagination;
  const { total, totalPages } = meta;
  const canPrevious = page > 1;
  const canNext = totalPages > 0 && page < totalPages;
  const pageSlots = getPageNumbers(page, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "No results"
          : `Showing ${from}–${to} of ${total}`}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const next = Number(value);
              if (
                ADMIN_PAGE_SIZE_OPTIONS.includes(next as AdminPageSize)
              ) {
                onPageSizeChange(next as AdminPageSize);
              }
            }}
          >
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canPrevious}
                onClick={() => onPageChange(page - 1)}
                aria-label="Go to previous page"
              >
                <ChevronLeftIcon data-icon="inline-start" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </PaginationItem>

            {pageSlots.map((slot, index) =>
              slot === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={slot}>
                  <Button
                    type="button"
                    variant={slot === page ? "outline" : "ghost"}
                    size="icon-sm"
                    onClick={() => onPageChange(slot)}
                    aria-label={`Go to page ${slot}`}
                    aria-current={slot === page ? "page" : undefined}
                  >
                    {slot}
                  </Button>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canNext}
                onClick={() => onPageChange(page + 1)}
                aria-label="Go to next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
