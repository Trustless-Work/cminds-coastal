"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { PublicProfileView } from "@repo/features/profile/views/PublicProfileView";
import { PublicProfileSkeleton } from "@repo/features/profile/components/skeletons/PublicProfileSkeleton";
import { Suspense, use } from "react";

type PublicProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = use(params);

  return (
    <AuthGate
      appRole="CMINDS_OPERATOR"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
    >
      <Suspense fallback={<PublicProfileSkeleton />}>
        <PublicProfileView userId={userId} />
      </Suspense>
    </AuthGate>
  );
}
