import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(""));

export const profileSchema = z.object({
  first_name: optionalText(80),
  last_name: optionalText(80),
  phone_number: z
    .string()
    .trim()
    .max(32, "Must be 32 characters or fewer")
    .regex(/^[+\d][\d\s().-]{5,31}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  country: optionalText(60),
  city: optionalText(80),
  bio: optionalText(500),
  community_id: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
