"use client";

import { Button } from "@repo/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import type { UserProfile } from "../../auth/types";
import { ProfileHeaderCard } from "../components/ProfileHeaderCard";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { ProfileViewSkeleton } from "../components/skeletons/ProfileViewSkeleton";
import { WalletBalanceCard } from "../components/WalletBalanceCard";
import { MY_PROFILE_QUERY_KEY, useMyProfile } from "../hooks/useMyProfile";
import { useProfileCommunities } from "../hooks/useProfileCommunities";
import { useProfileForm } from "../hooks/useProfileForm";

function resolveName(profile: UserProfile): string | null {
  const fromParts = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fromParts || profile.display_name;
}

const MyProfileContent = ({ profile }: { profile: UserProfile }) => {
  const queryClient = useQueryClient();
  const { form, onSubmit, loading, canEditCommunity } = useProfileForm({
    profile,
    onUpdated: (updated) =>
      queryClient.setQueryData(MY_PROFILE_QUERY_KEY, updated),
  });
  const { data: communities = [], isLoading: communitiesLoading } =
    useProfileCommunities(canEditCommunity);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-24 pt-8 sm:px-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </header>

      <div className="mt-8">
        <ProfileHeaderCard
          displayName={resolveName(profile)}
          email={profile.email}
          avatarUrl={profile.avatar_url}
          roles={profile.roles}
          action={
            <Button
              variant="outline"
              size="sm"
              render={<a href={`/dashboard/profile/${profile.user_id}`} />}
            >
              <Eye data-icon="inline-start" />
              Public Profile
            </Button>
          }
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileInfoForm
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            canEditCommunity={canEditCommunity}
            communities={communities}
            communitiesLoading={communitiesLoading}
          />
        </div>
        <aside className="space-y-6">
          <WalletBalanceCard
            walletAddress={profile.wallets[0]?.address ?? null}
          />
        </aside>
      </div>
    </div>
  );
};

export const MyProfileView = () => {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();

  if (isLoading) {
    return <ProfileViewSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-6 py-16 text-center">
        <p className="text-base font-semibold text-foreground">
          Could not load your profile
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return <MyProfileContent profile={profile} />;
};
