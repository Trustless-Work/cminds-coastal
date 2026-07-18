"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { MyProfileView } from "@repo/features/profile/views/MyProfileView";
import { ProfileViewSkeleton } from "@repo/features/profile/components/skeletons/ProfileViewSkeleton";
import { Suspense } from "react";

import { COMMUNITY_AUTH_SHELL } from "../../../constants/auth-shell";

export default function ProfilePage() {
  return (
    <AuthGate {...COMMUNITY_AUTH_SHELL}>
      <Suspense fallback={<ProfileViewSkeleton />}>
        <MyProfileView />
      </Suspense>
    </AuthGate>
  );
}
