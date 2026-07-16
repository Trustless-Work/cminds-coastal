"use client";

import Link from "next/link";
import { useWatch } from "react-hook-form";
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
import { Separator } from "@repo/ui/components/separator";
import { Textarea } from "@repo/ui/components/textarea";

import { useCommunities } from "../hooks/useCommunities";
import { useCreateEscrowForm } from "../hooks/useCreateEscrowForm";
import { EscrowCreateSummary } from "./EscrowCreateSummary";
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
    disputeResolver,
    selectCminds,
    selectReleaseSigner,
    selectDisputeResolver,
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
    control,
    formState: { errors },
  } = form;

  const title = useWatch({ control, name: "title", defaultValue: "" }) ?? "";
  const communityId =
    useWatch({ control, name: "communityId", defaultValue: "" }) ?? "";
  const engagementId =
    useWatch({ control, name: "engagementId", defaultValue: "" }) ?? "";
  const geographicArea =
    useWatch({ control, name: "geographicArea", defaultValue: "" }) ?? "";
  const description =
    useWatch({ control, name: "description", defaultValue: "" }) ?? "";

  const communityItems = communities.map((community) => ({
    value: community.community_id,
    label: community.name,
  }));
  const communityName =
    communities.find((c) => c.community_id === communityId)?.name ?? null;
  const selectedTasks = tasks.filter((task) =>
    (selectedTaskIds ?? []).includes(task.task_id),
  );

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
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Sign in with Pollar so we can initialize the escrow as service
            provider.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-8 space-y-2 lg:mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Create Escrow
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Build the project on the left. The draft on the right updates as you
          go — then initialize on Trustless Work.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-10 lg:col-span-6 xl:col-span-7">
          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                Project
              </h2>
              <p className="text-sm text-muted-foreground">
                Title, community, and cover for this conservation escrow.
              </p>
            </div>
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Coastal mangrove restoration — Q3"
                  {...register("title")}
                />
                {errors.title ? (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="communityId">Community</Label>
                  {communitiesLoading ? (
                    <Skeleton className="h-10 w-full rounded-xl" />
                  ) : (
                    <Select
                      items={communityItems}
                      value={communityId || null}
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
                  <Label htmlFor="engagementId">Engagement ID</Label>
                  <Input
                    id="engagementId"
                    placeholder="e.g. VO-2026-014"
                    {...register("engagementId")}
                  />
                  {errors.engagementId ? (
                    <p className="text-sm text-destructive">
                      {errors.engagementId.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="geographicArea">
                  Geographic Area (Optional)
                </Label>
                <Input
                  id="geographicArea"
                  placeholder="e.g. Gulf of Nicoya, Costa Rica"
                  {...register("geographicArea")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Briefly describe the conservation work this escrow will fund…"
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
              <EscrowImageField
                file={imageFile}
                onChange={setEscrowImage}
                error={imageError}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                Roles
              </h2>
              <p className="text-sm text-muted-foreground">
                CMinds reviews evidence; the release signer unlocks each
                approved milestone.
              </p>
            </div>
            <div className="grid gap-5">
              <UserEmailCombobox
                role="CMINDS_OPERATOR"
                label="CMinds Operator"
                value={cmindsUser}
                onChange={selectCminds}
                placeholder="Search CMinds by email…"
              />
              <UserEmailCombobox
                role="COMMUNITY_IMPLEMENTER"
                label="Release Signer"
                value={releaseSigner}
                onChange={selectReleaseSigner}
                placeholder="Search community by email…"
              />
              <UserEmailCombobox
                role="CMINDS_OPERATOR"
                label="Dispute Resolver"
                value={disputeResolver}
                onChange={selectDisputeResolver}
                placeholder="Search CMinds by email…"
              />
              {errors.cmindsUserId ? (
                <p className="text-sm text-destructive">
                  {errors.cmindsUserId.message}
                </p>
              ) : null}
              {errors.releaseSignerUserId ? (
                <p className="text-sm text-destructive">
                  {errors.releaseSignerUserId.message}
                </p>
              ) : null}
              {errors.disputeResolverUserId ? (
                <p className="text-sm text-destructive">
                  {errors.disputeResolverUserId.message}
                </p>
              ) : null}
            </div>
          </section>

          <Separator />

          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                Tasks
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a category, pick tasks, then set amounts and receivers.
              </p>
            </div>
            {tasksLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-40 rounded-2xl" />
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

          <Separator />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initializing…
              </>
            ) : (
              "Initialize escrow"
            )}
          </Button>
        </div>

        <div className="lg:col-span-6 xl:col-span-5">
          <div className="lg:sticky lg:top-24">
            <EscrowCreateSummary
              title={title}
              communityName={communityName}
              engagementId={engagementId}
              geographicArea={geographicArea}
              description={description}
              imageFile={imageFile}
              cmindsUser={cmindsUser}
              releaseSigner={releaseSigner}
              disputeResolver={disputeResolver}
              selectedTasks={selectedTasks}
              amounts={amounts ?? {}}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
