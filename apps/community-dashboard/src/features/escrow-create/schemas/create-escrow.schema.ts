import { z } from "zod";

const STELLAR_G_ADDRESS = /^G[A-Z2-7]{55}$/;

export const taskReceiverSchema = z.object({
  byEmail: z.boolean(),
  userId: z.string(),
  walletAddress: z.string(),
});

export type TaskReceiverValue = z.infer<typeof taskReceiverSchema>;

export const createEscrowSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    communityName: z.string().min(1, "Community name is required").max(200),
    description: z.string().min(10, "Description must be at least 10 characters"),
    geographicArea: z.string().max(500).optional(),
    engagementId: z.string().min(1, "Engagement id is required").max(100),
    cmindsUserId: z.string().uuid("Select a CMinds operator"),
    cmindsWalletAddress: z.string().min(1),
    releaseSignerUserId: z.string().uuid("Select a release signer"),
    releaseSignerWalletAddress: z.string().min(1),
    selectedTaskIds: z.array(z.string().uuid()).min(1, "Select at least one task"),
    amounts: z.record(z.string(), z.string()),
    receivers: z.record(z.string(), taskReceiverSchema),
    customDescription: z.string().max(2000).optional(),
  })
  .superRefine((values, ctx) => {
    for (const taskId of values.selectedTaskIds) {
      const raw = values.amounts[taskId]?.trim() ?? "";
      const amount = Number(raw);
      if (!raw || Number.isNaN(amount) || amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amounts", taskId],
          message: "Enter a fixed USDC amount greater than 0",
        });
      }

      const receiver = values.receivers[taskId];
      if (!receiver) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["receivers", taskId],
          message: "Select a receiver for this milestone",
        });
        continue;
      }

      if (receiver.byEmail && !receiver.userId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["receivers", taskId],
          message: "Select a receiver by email",
        });
      }

      if (!STELLAR_G_ADDRESS.test(receiver.walletAddress.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["receivers", taskId],
          message: receiver.byEmail
            ? "Selected user must have a valid Stellar wallet"
            : "Enter a valid Stellar G-address",
        });
      }
    }
  });

export type CreateEscrowFormValues = z.infer<typeof createEscrowSchema>;

export function createDefaultReceiver(): TaskReceiverValue {
  return {
    byEmail: true,
    userId: "",
    walletAddress: "",
  };
}
