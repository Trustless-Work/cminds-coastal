import { z } from "zod";

export const taskFormSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  category: z.string().min(1, "Category is required").max(100),
  name: z.string().min(1, "Name is required").max(200),
  expected_deliverable: z
    .string()
    .min(1, "Expected deliverable is required")
    .max(2000),
  is_active: z.boolean(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
