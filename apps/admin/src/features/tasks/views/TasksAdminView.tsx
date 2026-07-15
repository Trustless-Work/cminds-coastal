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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { ListChecks } from "lucide-react";
import { useState } from "react";

import { AdminPageScaffold } from "@/features/admin-shell/components/AdminPageScaffold";
import { ADMIN_NAV_ITEMS } from "@/features/admin-shell/constants/nav";

import { TaskFormDialog } from "../components/TaskFormDialog";
import {
  useAdminTasks,
  useTaskMutations,
  type TaskRecord,
} from "../hooks/useAdminTasks";
import type { TaskFormValues } from "../schemas/task.schema";

export const TasksAdminView = () => {
  const nav = ADMIN_NAV_ITEMS[1]!;
  const { data: tasks = [], isLoading } = useAdminTasks();
  const { createMutation, updateMutation, deleteMutation } = useTaskMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | null>(null);

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

  function handleDeactivate(task: TaskRecord): void {
    if (
      !window.confirm(
        `Deactivate task ${task.code}? It will be hidden from escrow create.`,
      )
    ) {
      return;
    }
    void deleteMutation.mutateAsync(task.task_id);
  }

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
        ) : tasks.length === 0 ? (
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
              {tasks.map((task) => (
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
                          onClick={() => handleDeactivate(task)}
                          disabled={deleteMutation.isPending}
                        >
                          Deactivate
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Deliverable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.task_id}>
                      <TableCell className="font-medium">{task.code}</TableCell>
                      <TableCell>{task.category}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {task.expected_deliverable}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {task.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              onClick={() => handleDeactivate(task)}
                              disabled={deleteMutation.isPending}
                            >
                              Deactivate
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </AdminPageScaffold>
  );
};
