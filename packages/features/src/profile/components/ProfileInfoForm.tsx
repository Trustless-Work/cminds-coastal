"use client";

import type { CommunityRecord } from "../../escrow/services/communities.service";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { ProfileFormValues } from "../schemas/profile.schema";
import { CountrySelect } from "./CountrySelect";
import { PhoneNumberInput } from "./PhoneNumberInput";

type ProfileInfoFormProps = {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  loading: boolean;
  canEditCommunity: boolean;
  communities: CommunityRecord[];
  communitiesLoading: boolean;
};

export const ProfileInfoForm = ({
  form,
  onSubmit,
  loading,
  canEditCommunity,
  communities,
  communitiesLoading,
}: ProfileInfoFormProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  const firstName =
    useWatch({ control, name: "first_name", defaultValue: "" }) ?? "";
  const lastName =
    useWatch({ control, name: "last_name", defaultValue: "" }) ?? "";
  const city = useWatch({ control, name: "city", defaultValue: "" }) ?? "";
  const bio = useWatch({ control, name: "bio", defaultValue: "" }) ?? "";
  const communityId =
    useWatch({ control, name: "community_id", defaultValue: "" }) ?? "";
  const phoneNumber =
    useWatch({ control, name: "phone_number", defaultValue: "" }) ?? "";
  const country =
    useWatch({ control, name: "country", defaultValue: "" }) ?? "";

  const setField = (
    name: keyof ProfileFormValues,
    value: string,
  ): void => {
    setValue(name, value, { shouldDirty: true, shouldValidate: true });
  };

  const communityItems = communities.map((community) => ({
    label: community.name,
    value: community.community_id,
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card className="rounded-[24px] border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              placeholder="Ada"
              value={firstName}
              onChange={(event) => setField("first_name", event.target.value)}
            />
            {errors.first_name ? (
              <p className="text-sm text-destructive">
                {errors.first_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              placeholder="Lovelace"
              value={lastName}
              onChange={(event) => setField("last_name", event.target.value)}
            />
            {errors.last_name ? (
              <p className="text-sm text-destructive">
                {errors.last_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone number</Label>
            <PhoneNumberInput
              id="phone_number"
              value={phoneNumber}
              onChange={(next) =>
                setValue("phone_number", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              invalid={Boolean(errors.phone_number)}
            />
            {errors.phone_number ? (
              <p className="text-sm text-destructive">
                {errors.phone_number.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <CountrySelect
              id="country"
              value={country}
              onChange={(next) =>
                setValue("country", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            {errors.country ? (
              <p className="text-sm text-destructive">
                {errors.country.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City / Region</Label>
            <Input
              id="city"
              placeholder="Puntarenas"
              value={city}
              onChange={(event) => setField("city", event.target.value)}
            />
            {errors.city ? (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {canEditCommunity ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="community_id">Community</Label>
                {communityId ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                    onClick={() =>
                      setValue("community_id", "", { shouldDirty: true })
                    }
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              {communitiesLoading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <Select
                  items={communityItems}
                  value={communityId || null}
                  onValueChange={(value) =>
                    setValue("community_id", String(value ?? ""), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="community_id" className="w-full">
                    <SelectValue placeholder="Select your community" />
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
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell others about your work in coastal conservation."
              value={bio}
              onChange={(event) => setField("bio", event.target.value)}
            />
            {errors.bio ? (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
