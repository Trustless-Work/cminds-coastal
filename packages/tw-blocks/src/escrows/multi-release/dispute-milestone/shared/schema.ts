import { z } from "zod";

export const disputeMilestoneSchema = z.object({
  milestoneIndex: z
    .string({ required_error: "Milestone is required" })
    .min(1, { message: "Milestone is required" }),
});

export type DisputeMilestoneValues = z.infer<typeof disputeMilestoneSchema>;
