import { z } from "zod";

export const releaseMilestoneSchema = z.object({
  milestoneIndex: z
    .string({ required_error: "Task is required" })
    .min(1, { message: "Task is required" }),
});

export type ReleaseMilestoneValues = z.infer<typeof releaseMilestoneSchema>;

