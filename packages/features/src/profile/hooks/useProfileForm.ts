"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/config";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { UserProfile } from "../../auth/types";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schema";
import { updateMyProfile } from "../services/profile.service";
import type { UpdateProfilePayload } from "../types";

type UseProfileFormOptions = {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
};

type UseProfileFormResult = {
  form: ReturnType<typeof useForm<ProfileFormValues>>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  loading: boolean;
  canEditCommunity: boolean;
};

function toDefaultValues(profile: UserProfile): ProfileFormValues {
  return {
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    phone_number: profile.phone_number ?? "",
    country: profile.country ?? "",
    city: profile.city ?? "",
    bio: profile.bio ?? "",
    community_id: profile.community_id ?? "",
  };
}

/** Empty string clears the field on the server. */
function toNullable(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function useProfileForm({
  profile,
  onUpdated,
}: UseProfileFormOptions): UseProfileFormResult {
  const canEditCommunity = profile.roles.includes("COMMUNITY_IMPLEMENTER");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toDefaultValues(profile),
  });

  const { reset, formState } = form;

  // Sync the form from the server only when the profile identity changes.
  // Re-running on every refetch would clobber the user's in-progress edits.
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (syncedUserId.current === profile.user_id) {
      return;
    }
    syncedUserId.current = profile.user_id;
    reset(toDefaultValues(profile));
  }, [profile, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: UpdateProfilePayload = {
      first_name: toNullable(values.first_name),
      last_name: toNullable(values.last_name),
      phone_number: toNullable(values.phone_number),
      country: toNullable(values.country),
      city: toNullable(values.city),
      bio: toNullable(values.bio),
    };

    if (canEditCommunity) {
      payload.community_id = toNullable(values.community_id);
    }

    try {
      const updated = await updateMyProfile(payload);
      onUpdated(updated);
      reset(toDefaultValues(updated));
      toastSuccess(
        "Profile Updated",
        "Your profile changes have been saved.",
      );
    } catch (error) {
      toastError(
        "Failed to Update Profile",
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  });

  return {
    form,
    onSubmit,
    loading: formState.isSubmitting,
    canEditCommunity,
  };
}
