-- AlterTable
ALTER TABLE "escrow" ADD COLUMN "dispute_resolver_user_id" UUID;

-- CreateIndex
CREATE INDEX "escrow_dispute_resolver_user_id_idx" ON "escrow"("dispute_resolver_user_id");

-- AddForeignKey
ALTER TABLE "escrow" ADD CONSTRAINT "escrow_dispute_resolver_user_id_fkey" FOREIGN KEY ("dispute_resolver_user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
