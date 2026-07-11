import { z } from "zod";

export const releaseMilestoneSchema = z.object({
  milestoneIndex: z
    .string({ required_error: "Milestone is required" })
    .min(1, { message: "Milestone is required" }),
});

export type ReleaseMilestoneValues = z.infer<typeof releaseMilestoneSchema>;

