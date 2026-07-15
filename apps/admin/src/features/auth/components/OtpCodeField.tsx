"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@repo/ui/components/input-otp";
import type { Control, FieldValues, Path } from "react-hook-form";

type OtpCodeFieldProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: Path<TValues>;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
};

export const OtpCodeField = <TValues extends FieldValues>({
  control,
  name,
  label = "Authentication Code",
  disabled,
  autoFocus,
  onComplete,
}: OtpCodeFieldProps<TValues>) => {
  const slotClassName =
    "size-11 min-h-11 sm:size-14 sm:min-h-14 text-lg font-semibold tabular-nums tracking-wide sm:text-2xl";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col items-center gap-4 text-center">
          <FormLabel className="text-base font-medium">{label}</FormLabel>
          <FormControl>
            <InputOTP
              maxLength={6}
              autoFocus={autoFocus}
              disabled={disabled}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              onComplete={onComplete}
              inputMode="numeric"
              pattern="^[0-9]+$"
              containerClassName="mx-auto w-full max-w-md justify-center gap-2 px-2 sm:gap-3 sm:px-0"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className={slotClassName} />
                <InputOTPSlot index={1} className={slotClassName} />
                <InputOTPSlot index={2} className={slotClassName} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-1 shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-6" />
              <InputOTPGroup>
                <InputOTPSlot index={3} className={slotClassName} />
                <InputOTPSlot index={4} className={slotClassName} />
                <InputOTPSlot index={5} className={slotClassName} />
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage className="w-full text-center" />
        </FormItem>
      )}
    />
  );
};
