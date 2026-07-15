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

import {
  communityFormSchema,
  type CommunityFormValues,
} from "../schemas/community.schema";
import type { CommunityRecord } from "../hooks/useAdminCommunities";

type CommunityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community?: CommunityRecord | null;
  loading?: boolean;
  onSubmit: (values: CommunityFormValues) => Promise<void> | void;
};

export const CommunityFormDialog = ({
  open,
  onOpenChange,
  community,
  loading,
  onSubmit,
}: CommunityFormDialogProps) => {
  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset({
      name: community?.name ?? "",
      description: community?.description ?? "",
      is_active: community?.is_active ?? true,
    });
  }, [open, community, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {community ? "Edit community" : "New community"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
            })}
            noValidate
          >
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
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {community ? (
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
                        Inactive communities are hidden from escrow create.
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
                {loading ? "Saving…" : community ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
