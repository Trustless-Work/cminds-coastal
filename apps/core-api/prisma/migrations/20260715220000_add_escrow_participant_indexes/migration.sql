-- CreateIndex
CREATE INDEX "escrow_approver_user_id_idx" ON "escrow"("approver_user_id");

-- CreateIndex
CREATE INDEX "escrow_release_signer_user_id_idx" ON "escrow"("release_signer_user_id");
