"use client";

import { formatAddress } from "@repo/helpers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import type { PublicUserProfile } from "../types";

type PublicProfileCardProps = {
  profile: PublicUserProfile;
};

function resolveName(profile: PublicUserProfile): string | null {
  const fromParts = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fromParts || profile.display_name;
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm text-foreground">{value}</p>
    </div>
  </div>
);

export const PublicProfileCard = ({ profile }: PublicProfileCardProps) => {
  const details: ReactNode[] = [];

  if (profile.email) {
    details.push(
      <DetailRow key="email" icon={Mail} label="Email" value={profile.email} />,
    );
  }
  if (profile.phone_number) {
    details.push(
      <DetailRow
        key="phone"
        icon={Phone}
        label="Phone"
        value={profile.phone_number}
      />,
    );
  }
  if (profile.country) {
    details.push(
      <DetailRow
        key="country"
        icon={Globe}
        label="Country"
        value={profile.country}
      />,
    );
  }
  if (profile.city) {
    details.push(
      <DetailRow key="city" icon={MapPin} label="City / Region" value={profile.city} />,
    );
  }
  if (profile.community) {
    details.push(
      <DetailRow
        key="community"
        icon={Users}
        label="Community"
        value={profile.community.name}
      />,
    );
  }
  if (profile.wallet_address) {
    details.push(
      <DetailRow
        key="wallet"
        icon={Wallet}
        label="Wallet"
        value={
          <span className="font-mono">
            {formatAddress(profile.wallet_address, 6)}
          </span>
        }
      />,
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeaderCard
        displayName={resolveName(profile)}
        avatarUrl={profile.avatar_url}
        roles={profile.roles}
      />

      {profile.bio ? (
        <Card className="rounded-[24px] border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.05)] [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {details.length > 0 ? (
        <Card className="rounded-[24px] border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.05)] [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {details}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
