"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
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
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
            })}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="G-05"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expected_deliverable"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Expected deliverable</FormLabel>
                  <FormControl>
                    <Textarea rows={3} disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {task ? (
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        disabled={loading}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                        }}
                      />
                    </FormControl>
                    <div className="flex flex-col gap-1">
                      <FormLabel className="font-medium leading-none">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Inactive tasks are hidden when creating escrows.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};
