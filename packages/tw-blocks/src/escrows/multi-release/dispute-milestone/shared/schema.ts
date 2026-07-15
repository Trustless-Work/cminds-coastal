import { z } from "zod";

export const disputeMilestoneSchema = z.object({
  milestoneIndex: z
    .string({ required_error: "Task is required" })
    .min(1, { message: "Task is required" }),
});

export type DisputeMilestoneValues = z.infer<typeof disputeMilestoneSchema>;
