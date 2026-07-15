-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "EscrowStatus" AS ENUM ('DRAFT', 'INITIALIZED', 'FUNDED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "task" (
    "task_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expected_deliverable" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "escrow" (
    "escrow_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "community_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "geographic_area" TEXT,
    "status" "EscrowStatus" NOT NULL DEFAULT 'INITIALIZED',
    "engagement_id" TEXT NOT NULL,
    "initializer_user_id" UUID NOT NULL,
    "approver_user_id" UUID,
    "release_signer_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_pkey" PRIMARY KEY ("escrow_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "escrow_milestone" (
    "escrow_milestone_id" UUID NOT NULL,
    "escrow_id" TEXT NOT NULL,
    "task_id" UUID NOT NULL,
    "milestone_index" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "deadline" TIMESTAMP(3),
    "custom_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_milestone_pkey" PRIMARY KEY ("escrow_milestone_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "task_code_key" ON "task"("code");
CREATE INDEX IF NOT EXISTS "task_is_active_idx" ON "task"("is_active");
CREATE INDEX IF NOT EXISTS "task_category_idx" ON "task"("category");

CREATE INDEX IF NOT EXISTS "escrow_initializer_user_id_idx" ON "escrow"("initializer_user_id");
CREATE INDEX IF NOT EXISTS "escrow_status_idx" ON "escrow"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "escrow_milestone_escrow_id_task_id_key" ON "escrow_milestone"("escrow_id", "task_id");
CREATE UNIQUE INDEX IF NOT EXISTS "escrow_milestone_escrow_id_milestone_index_key" ON "escrow_milestone"("escrow_id", "milestone_index");
CREATE INDEX IF NOT EXISTS "escrow_milestone_escrow_id_idx" ON "escrow_milestone"("escrow_id");
CREATE INDEX IF NOT EXISTS "escrow_milestone_task_id_idx" ON "escrow_milestone"("task_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "escrow" ADD CONSTRAINT "escrow_initializer_user_id_fkey" FOREIGN KEY ("initializer_user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "escrow" ADD CONSTRAINT "escrow_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "escrow" ADD CONSTRAINT "escrow_release_signer_user_id_fkey" FOREIGN KEY ("release_signer_user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "escrow_milestone" ADD CONSTRAINT "escrow_milestone_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrow"("escrow_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "escrow_milestone" ADD CONSTRAINT "escrow_milestone_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
