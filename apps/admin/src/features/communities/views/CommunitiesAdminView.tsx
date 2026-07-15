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
import { Users } from "lucide-react";
import { useState } from "react";

import { AdminPageScaffold } from "@/features/admin-shell/components/AdminPageScaffold";
import { ADMIN_NAV_ITEMS } from "@/features/admin-shell/constants/nav";

import { CommunityFormDialog } from "../components/CommunityFormDialog";
import {
  useAdminCommunities,
  useCommunityMutations,
  type CommunityRecord,
} from "../hooks/useAdminCommunities";
import type { CommunityFormValues } from "../schemas/community.schema";

export const CommunitiesAdminView = () => {
  const nav = ADMIN_NAV_ITEMS[2]!;
  const { data: communities = [], isLoading } = useAdminCommunities();
  const { createMutation, updateMutation, deleteMutation } =
    useCommunityMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CommunityRecord | null>(null);

  const saving = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: CommunityFormValues): Promise<void> {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.community_id,
        payload: {
          name: values.name,
          description: values.description?.trim() || null,
          is_active: values.is_active,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description?.trim() || undefined,
      });
    }
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate(): void {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(community: CommunityRecord): void {
    setEditing(community);
    setDialogOpen(true);
  }

  function handleDeactivate(community: CommunityRecord): void {
    if (
      !window.confirm(
        `Deactivate “${community.name}”? It will be hidden from escrow create.`,
      )
    ) {
      return;
    }
    void deleteMutation.mutateAsync(community.community_id);
  }

  return (
    <AdminPageScaffold title={nav.title} description={nav.description}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button type="button" onClick={openCreate}>
            Add community
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-xl md:hidden" />
            <Skeleton className="hidden h-40 w-full rounded-xl md:block" />
          </div>
        ) : communities.length === 0 ? (
          <NoData
            title="No communities yet"
            description="Create the first coastal community to use in escrow requests."
            icon={<Users />}
            action={
              <Button type="button" size="sm" onClick={openCreate}>
                Add community
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {communities.map((community) => (
                <Card key={community.community_id}>
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {community.name}
                      </CardTitle>
                      <Badge variant="outline">
                        {community.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {community.description ? (
                      <CardDescription>{community.description}</CardDescription>
                    ) : null}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(community)}
                      >
                        Edit
                      </Button>
                      {community.is_active ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeactivate(community)}
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
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((community) => (
                    <TableRow key={community.community_id}>
                      <TableCell className="font-medium">
                        {community.name}
                      </TableCell>
                      <TableCell className="max-w-sm truncate text-muted-foreground">
                        {community.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {community.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(community)}
                          >
                            Edit
                          </Button>
                          {community.is_active ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivate(community)}
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

      <CommunityFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        community={editing}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </AdminPageScaffold>
  );
};
