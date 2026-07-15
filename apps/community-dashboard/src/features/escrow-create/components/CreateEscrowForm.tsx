"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Textarea } from "@repo/ui/components/textarea";

import { useCommunities } from "../hooks/useCommunities";
import { useCreateEscrowForm } from "../hooks/useCreateEscrowForm";
import { EscrowImageField } from "./EscrowImageField";
import { TaskPicker } from "./TaskPicker";
import { UserEmailCombobox } from "./UserEmailCombobox";

function fieldErrorMessage(
  error: { message?: string } | undefined,
): string | undefined {
  return error?.message;
}

export const CreateEscrowForm = () => {
  const { data: communities = [], isLoading: communitiesLoading } =
    useCommunities();
  const {
    form,
    tasks,
    tasksLoading,
    cmindsUser,
    releaseSigner,
    selectCminds,
    selectReleaseSigner,
    selectedTaskIds,
    amounts,
    receivers,
    receiverUsers,
    customDescription,
    imageFile,
    imageError,
    setEscrowImage,
    toggleTask,
    setTaskAmount,
    setTaskReceiver,
    setTaskReceiverUser,
    setCustomDescription,
    onSubmit,
    isSubmitting,
    walletAddress,
  } = useCreateEscrowForm();

  const {
    register,
    formState: { errors },
  } = form;

  const amountErrors: Record<string, string | undefined> = {};
  const receiverErrors: Record<string, string | undefined> = {};
  for (const taskId of selectedTaskIds ?? []) {
    amountErrors[taskId] = fieldErrorMessage(errors.amounts?.[taskId]);
    receiverErrors[taskId] = fieldErrorMessage(errors.receivers?.[taskId]);
  }

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect your wallet</CardTitle>
          <CardDescription>
            Sign in with Pollar so we can initialize the escrow as service
            provider.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create escrow
        </h1>
        <p className="text-sm text-muted-foreground">
          Select tasks, set fixed amounts, pick CMinds and release signer —
          we wire Trustless Work roles underneath.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Project title</Label>
          <Input id="title" {...register("title")} />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="communityId">Community</Label>
          {communitiesLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <Select
              value={form.watch("communityId") || undefined}
              onValueChange={(value) => {
                form.setValue("communityId", String(value ?? ""), {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            >
              <SelectTrigger id="communityId" className="w-full">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem
                    key={community.community_id}
                    value={community.community_id}
                  >
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.communityId ? (
            <p className="text-sm text-destructive">
              {errors.communityId.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="engagementId">Engagement id</Label>
          <Input id="engagementId" {...register("engagementId")} />
          {errors.engagementId ? (
            <p className="text-sm text-destructive">
              {errors.engagementId.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="geographicArea">Geographic area (optional)</Label>
          <Input id="geographicArea" {...register("geographicArea")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} {...register("description")} />
          {errors.description ? (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <EscrowImageField
            file={imageFile}
            onChange={setEscrowImage}
            error={imageError}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <UserEmailCombobox
          role="CMINDS_OPERATOR"
          label="CMinds operator"
          value={cmindsUser}
          onChange={selectCminds}
          placeholder="Search CMinds by email…"
        />
        <UserEmailCombobox
          role="COMMUNITY_IMPLEMENTER"
          label="Release signer"
          value={releaseSigner}
          onChange={selectReleaseSigner}
          placeholder="Search community by email…"
        />
        {errors.cmindsUserId ? (
          <p className="text-sm text-destructive sm:col-span-2">
            {errors.cmindsUserId.message}
          </p>
        ) : null}
        {errors.releaseSignerUserId ? (
          <p className="text-sm text-destructive sm:col-span-2">
            {errors.releaseSignerUserId.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Each selected task becomes a funded multi-release item with its own
            receiver.
          </p>
        </div>
        {tasksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <TaskPicker
            tasks={tasks}
            selectedTaskIds={selectedTaskIds ?? []}
            amounts={amounts ?? {}}
            receivers={receivers ?? {}}
            receiverUsers={receiverUsers}
            customDescription={customDescription}
            amountErrors={amountErrors}
            receiverErrors={receiverErrors}
            onToggle={toggleTask}
            onAmountChange={setTaskAmount}
            onReceiverChange={setTaskReceiver}
            onReceiverUserChange={setTaskReceiverUser}
            onCustomDescriptionChange={setCustomDescription}
          />
        )}
        {errors.selectedTaskIds ? (
          <p className="text-sm text-destructive">
            {errors.selectedTaskIds.message}
          </p>
        ) : null}
      </section>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Initializing…
          </>
        ) : (
          "Initialize escrow"
        )}
      </Button>
    </form>
  );
};
