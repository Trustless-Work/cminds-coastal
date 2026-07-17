-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "EvidenceRefKind" AS ENUM ('FILE', 'URL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "evidence_ref" (
  "id" VARCHAR(32) NOT NULL,
  "kind" "EvidenceRefKind" NOT NULL,
  "storage_path" TEXT,
  "public_url" TEXT,
  "external_url" TEXT,
  "filename" TEXT,
  "mime_type" TEXT,
  "escrow_id" TEXT,
  "milestone_index" INTEGER,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "evidence_ref_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "evidence_ref_created_by_idx" ON "evidence_ref"("created_by");
CREATE INDEX IF NOT EXISTS "evidence_ref_escrow_id_milestone_index_idx" ON "evidence_ref"("escrow_id", "milestone_index");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "evidence_ref"
    ADD CONSTRAINT "evidence_ref_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "user"("user_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
