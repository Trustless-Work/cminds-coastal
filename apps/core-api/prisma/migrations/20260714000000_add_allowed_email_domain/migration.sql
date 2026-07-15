-- CreateTable
CREATE TABLE IF NOT EXISTS "allowed_email_domain" (
    "domain_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowed_email_domain_pkey" PRIMARY KEY ("domain_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "allowed_email_domain_domain_key" ON "allowed_email_domain"("domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "allowed_email_domain_is_active_idx" ON "allowed_email_domain"("is_active");

-- Seed allowlist for CMinds operators
INSERT INTO "allowed_email_domain" ("domain_id", "domain", "is_active", "created_at", "updated_at")
VALUES (gen_random_uuid(), 'trustlesswork.com', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("domain") DO UPDATE SET "is_active" = true, "updated_at" = CURRENT_TIMESTAMP;
