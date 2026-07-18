"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { PublicProfileView } from "@repo/features/profile/views/PublicProfileView";
import { PublicProfileSkeleton } from "@repo/features/profile/components/skeletons/PublicProfileSkeleton";
import { Suspense, use } from "react";

import { COMMUNITY_AUTH_SHELL } from "../../../../constants/auth-shell";

type PublicProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = use(params);

  return (
    <AuthGate {...COMMUNITY_AUTH_SHELL}>
      <Suspense fallback={<PublicProfileSkeleton />}>
        <PublicProfileView userId={userId} />
      </Suspense>
    </AuthGate>
  );
}
