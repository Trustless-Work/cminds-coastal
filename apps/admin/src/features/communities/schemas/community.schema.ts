import { z } from "zod";

export const communityFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  is_active: z.boolean(),
});

export type CommunityFormValues = z.infer<typeof communityFormSchema>;
