"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { TaskRecord } from "../hooks/useAdminTasks";
import {
  taskFormSchema,
  type TaskFormValues,
} from "../schemas/task.schema";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRecord | null;
  loading?: boolean;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
};

export const TaskFormDialog = ({
  open,
  onOpenChange,
  task,
  loading,
  onSubmit,
}: TaskFormDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      code: "",
      category: "",
      name: "",
      expected_deliverable: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset({
      code: task?.code ?? "",
      category: task?.category ?? "",
      name: task?.name ?? "",
      expected_deliverable: task?.expected_deliverable ?? "",
      is_active: task?.is_active ?? true,
    });
  }, [open, task, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-code">Code</Label>
              <Input
                id="task-code"
                disabled={loading}
                placeholder="G-05"
                {...form.register("code")}
              />
              {form.formState.errors.code ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.code.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-category">Category</Label>
              <Input
                id="task-category"
                disabled={loading}
                {...form.register("category")}
              />
              {form.formState.errors.category ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.category.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              disabled={loading}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-deliverable">Expected deliverable</Label>
            <Textarea
              id="task-deliverable"
              rows={3}
              disabled={loading}
              {...form.register("expected_deliverable")}
            />
            {form.formState.errors.expected_deliverable ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.expected_deliverable.message}
              </p>
            ) : null}
          </div>
          {task ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={form.watch("is_active")}
                onChange={(event) =>
                  form.setValue("is_active", event.target.checked, {
                    shouldDirty: true,
                  })
                }
                disabled={loading}
              />
              Active
            </label>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : task ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
