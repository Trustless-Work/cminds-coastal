import { z } from "zod";
import {
  MAX_EVIDENCE_FILES,
  MAX_EVIDENCE_URLS,
} from "@repo/helpers";

export const changeMilestoneStatusSchema = z.object({
  milestoneIndex: z
    .string({ required_error: "Task is required" })
    .min(1, { message: "Task is required" }),
  status: z
    .string({ required_error: "Status is required" })
    .min(1, { message: "Status is required" }),
  evidenceUrls: z
    .array(z.string().url({ message: "Enter a valid URL" }))
    .max(MAX_EVIDENCE_URLS, {
      message: `Maximum ${MAX_EVIDENCE_URLS} URLs allowed`,
    }),
});

export type ChangeMilestoneStatusValues = z.infer<
  typeof changeMilestoneStatusSchema
>;

export { MAX_EVIDENCE_FILES, MAX_EVIDENCE_URLS };
