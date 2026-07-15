"use client";

import { NoData } from "@repo/shared/NoData";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { ColumnDef } from "@tanstack/react-table";
import { ListChecks } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminPageScaffold } from "@/features/admin-shell/components/AdminPageScaffold";
import { ADMIN_NAV_ITEMS } from "@/features/admin-shell/constants/nav";
import { AdminDataTable } from "@/features/data-table/components/AdminDataTable";
import { AdminTablePagination } from "@/features/data-table/components/AdminTablePagination";
import { ConfirmDialog } from "@/features/data-table/components/ConfirmDialog";

import { TaskFormDialog } from "../components/TaskFormDialog";
import {
  useAdminTasks,
  useTaskMutations,
  type TaskRecord,
} from "../hooks/useAdminTasks";
import type { TaskFormValues } from "../schemas/task.schema";

export const TasksAdminView = () => {
  const nav = ADMIN_NAV_ITEMS[1]!;
  const { items, meta, pagination, setPagination, isLoading } = useAdminTasks();
  const { createMutation, updateMutation, deleteMutation } = useTaskMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<TaskRecord | null>(
    null,
  );

  const saving = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: TaskFormValues): Promise<void> {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.task_id,
        payload: {
          code: values.code,
          category: values.category,
          name: values.name,
          expected_deliverable: values.expected_deliverable,
          is_active: values.is_active,
        },
      });
    } else {
      await createMutation.mutateAsync({
        code: values.code,
        category: values.category,
        name: values.name,
        expected_deliverable: values.expected_deliverable,
      });
    }
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate(): void {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(task: TaskRecord): void {
    setEditing(task);
    setDialogOpen(true);
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) {
      return;
    }
    await deleteMutation.mutateAsync(pendingDeactivate.task_id);
    setPendingDeactivate(null);
  }

  const columns = useMemo<ColumnDef<TaskRecord>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.code}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "expected_deliverable",
        header: "Deliverable",
        cell: ({ row }) => (
          <span className="max-w-xs truncate text-muted-foreground">
            {row.original.expected_deliverable}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openEdit(task)}
              >
                Edit
              </Button>
              {task.is_active ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingDeactivate(task)}
                  disabled={deleteMutation.isPending}
                >
                  Deactivate
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [deleteMutation.isPending],
  );

  const showEmpty = !isLoading && meta.total === 0;

  return (
    <AdminPageScaffold title={nav.title} description={nav.description}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button type="button" onClick={openCreate}>
            Add task
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-xl md:hidden" />
            <Skeleton className="hidden h-40 w-full rounded-xl md:block" />
          </div>
        ) : showEmpty ? (
          <NoData
            title="No tasks yet"
            description="Add conservation tasks to the fixed menu communities use when creating escrows."
            icon={<ListChecks />}
            action={
              <Button type="button" size="sm" onClick={openCreate}>
                Add task
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {items.map((task) => (
                <Card key={task.task_id}>
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base">
                          {task.code} · {task.name}
                        </CardTitle>
                        <CardDescription>{task.category}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {task.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.expected_deliverable}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(task)}
                      >
                        Edit
                      </Button>
                      {task.is_active ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingDeactivate(task)}
                          disabled={deleteMutation.isPending}
                        >
                          Deactivate
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                </Card>
              ))}
              <AdminTablePagination
                pagination={pagination}
                meta={meta}
                onPageChange={(page) => setPagination({ ...pagination, page })}
                onPageSizeChange={(pageSize) =>
                  setPagination({ page: 1, pageSize })
                }
              />
            </div>

            <div className="hidden md:block">
              <AdminDataTable
                columns={columns}
                data={items}
                pagination={pagination}
                meta={meta}
                onPaginationChange={setPagination}
              />
            </div>
          </>
        )}
      </div>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        task={editing}
        loading={saving}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={pendingDeactivate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeactivate(null);
        }}
        title="Deactivate task?"
        description={
          pendingDeactivate
            ? `Task ${pendingDeactivate.code} will be hidden when creating escrows. You can reactivate it later from Edit.`
            : ""
        }
        confirmLabel="Deactivate"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={confirmDeactivate}
      />
    </AdminPageScaffold>
  );
};
