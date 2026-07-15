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
import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminPageScaffold } from "@/features/admin-shell/components/AdminPageScaffold";
import { ADMIN_NAV_ITEMS } from "@/features/admin-shell/constants/nav";
import { AdminDataTable } from "@/features/data-table/components/AdminDataTable";
import { AdminTablePagination } from "@/features/data-table/components/AdminTablePagination";
import { ConfirmDialog } from "@/features/data-table/components/ConfirmDialog";

import { CommunityFormDialog } from "../components/CommunityFormDialog";
import {
  useAdminCommunities,
  useCommunityMutations,
  type CommunityRecord,
} from "../hooks/useAdminCommunities";
import type { CommunityFormValues } from "../schemas/community.schema";

export const CommunitiesAdminView = () => {
  const nav = ADMIN_NAV_ITEMS[2]!;
  const { items, meta, pagination, setPagination, isLoading } =
    useAdminCommunities();
  const { createMutation, updateMutation, deleteMutation } =
    useCommunityMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CommunityRecord | null>(null);
  const [pendingDeactivate, setPendingDeactivate] =
    useState<CommunityRecord | null>(null);

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

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) {
      return;
    }
    await deleteMutation.mutateAsync(pendingDeactivate.community_id);
    setPendingDeactivate(null);
  }

  const columns = useMemo<ColumnDef<CommunityRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="max-w-sm truncate text-muted-foreground">
            {row.original.description || "—"}
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
          const community = row.original;
          return (
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
                              onClick={() => setPendingDeactivate(community)}
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
            Add community
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-xl md:hidden" />
            <Skeleton className="hidden h-40 w-full rounded-xl md:block" />
          </div>
        ) : showEmpty ? (
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
              {items.map((community) => (
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
                              onClick={() => setPendingDeactivate(community)}
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

      <ConfirmDialog
        open={pendingDeactivate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeactivate(null);
        }}
        title="Deactivate community?"
        description={
          pendingDeactivate
            ? `“${pendingDeactivate.name}” will be hidden from escrow create. You can reactivate it later from Edit.`
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
