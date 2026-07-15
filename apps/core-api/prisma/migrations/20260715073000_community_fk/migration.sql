-- CreateTable
CREATE TABLE "community" (
    "community_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_pkey" PRIMARY KEY ("community_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_name_key" ON "community"("name");

-- CreateIndex
CREATE INDEX "community_is_active_idx" ON "community"("is_active");

-- Add nullable column for backfill
ALTER TABLE "escrow" ADD COLUMN "community_id" UUID;

-- Backfill communities from distinct escrow.community_name values
INSERT INTO "community" ("community_id", "name", "description", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), trimmed.name, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT TRIM("community_name") AS name
  FROM "escrow"
  WHERE TRIM("community_name") <> ''
) AS trimmed
WHERE NOT EXISTS (
  SELECT 1 FROM "community" c WHERE c."name" = trimmed.name
);

UPDATE "escrow" e
SET "community_id" = c."community_id"
FROM "community" c
WHERE c."name" = TRIM(e."community_name");

-- Escrows with empty community_name get a fallback community
INSERT INTO "community" ("community_id", "name", "description", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), 'Unassigned', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1 FROM "escrow" WHERE "community_id" IS NULL
)
AND NOT EXISTS (
  SELECT 1 FROM "community" WHERE "name" = 'Unassigned'
);

UPDATE "escrow"
SET "community_id" = (
  SELECT "community_id" FROM "community" WHERE "name" = 'Unassigned' LIMIT 1
)
WHERE "community_id" IS NULL;

-- Make required and drop old column
ALTER TABLE "escrow" ALTER COLUMN "community_id" SET NOT NULL;
ALTER TABLE "escrow" DROP COLUMN "community_name";

-- AddForeignKey
ALTER TABLE "escrow" ADD CONSTRAINT "escrow_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("community_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "escrow_community_id_idx" ON "escrow"("community_id");
