"use client";

import type { UserSearchResult } from "@repo/features/auth/services/users-search.service";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

import type { TaskReceiverValue } from "../schemas/create-escrow.schema";
import { UserEmailCombobox } from "./UserEmailCombobox";

type MilestoneReceiverFieldProps = {
  taskId: string;
  value: TaskReceiverValue;
  selectedUser: UserSearchResult | null;
  onChange: (value: TaskReceiverValue) => void;
  onUserChange: (user: UserSearchResult | null) => void;
  error?: string;
};

export const MilestoneReceiverField = ({
  taskId,
  value,
  selectedUser,
  onChange,
  onUserChange,
  error,
}: MilestoneReceiverFieldProps) => {
  return (
    <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={value.byEmail}
          onCheckedChange={(checked) => {
            const byEmail = checked === true;
            onUserChange(null);
            onChange({
              byEmail,
              userId: "",
              walletAddress: "",
            });
          }}
        />
        <span className="text-sm font-medium leading-none">
          Select receiver by email
        </span>
      </div>

      {value.byEmail ? (
        <UserEmailCombobox
          label="Receiver"
          value={selectedUser}
          onChange={(user) => {
            onUserChange(user);
            onChange({
              byEmail: true,
              userId: user?.user_id ?? "",
              walletAddress: user?.wallet_address ?? "",
            });
          }}
          placeholder="Search any user by email…"
        />
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`receiver-wallet-${taskId}`}>
            Receiver wallet
          </Label>
          <Input
            id={`receiver-wallet-${taskId}`}
            value={value.walletAddress}
            onChange={(event) =>
              onChange({
                byEmail: false,
                userId: "",
                walletAddress: event.target.value.trim(),
              })
            }
            placeholder="G…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
