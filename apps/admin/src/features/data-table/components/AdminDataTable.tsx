"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

import { AdminTablePagination } from "./AdminTablePagination";
import type {
  AdminPageSize,
  AdminPaginationMeta,
  AdminPaginationState,
} from "../types";

type AdminDataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pagination: AdminPaginationState;
  meta: AdminPaginationMeta;
  onPaginationChange: (next: AdminPaginationState) => void;
  isLoading?: boolean;
};

export function AdminDataTable<TData>({
  columns,
  data,
  pagination,
  meta,
  onPaginationChange,
  isLoading = false,
}: AdminDataTableProps<TData>) {
  const tablePagination: PaginationState = {
    pageIndex: Math.max(pagination.page - 1, 0),
    pageSize: pagination.pageSize,
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(tablePagination) : updater;
    onPaginationChange({
      page: next.pageIndex + 1,
      pageSize: next.pageSize as AdminPageSize,
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta.totalPages,
    state: {
      pagination: tablePagination,
    },
    onPaginationChange: handlePaginationChange,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminTablePagination
        pagination={pagination}
        meta={meta}
        onPageChange={(page) =>
          onPaginationChange({ ...pagination, page })
        }
        onPageSizeChange={(pageSize) =>
          onPaginationChange({ page: 1, pageSize })
        }
      />
    </div>
  );
}
