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
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="community-name">Name</Label>
            <Input
              id="community-name"
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
            <Label htmlFor="community-description">Description</Label>
            <Textarea
              id="community-description"
              rows={3}
              disabled={loading}
              {...form.register("description")}
            />
          </div>
          {community ? (
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
              {loading ? "Saving…" : community ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
