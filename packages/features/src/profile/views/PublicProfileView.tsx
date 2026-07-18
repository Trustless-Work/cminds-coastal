"use client";

import { PublicProfileCard } from "../components/PublicProfileCard";
import { PublicProfileSkeleton } from "../components/skeletons/PublicProfileSkeleton";
import { usePublicProfile } from "../hooks/usePublicProfile";

type PublicProfileViewProps = {
  userId: string;
};

export const PublicProfileView = ({ userId }: PublicProfileViewProps) => {
  const { data: profile, isLoading, isError } = usePublicProfile(userId);

  if (isLoading) {
    return <PublicProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-[820px] px-6 py-16 text-center">
        <p className="text-base font-semibold text-foreground">
          Profile not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This user does not exist or is no longer active.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-6 pb-24 pt-8 sm:px-10">
      <PublicProfileCard profile={profile} />
    </div>
  );
};
