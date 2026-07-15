-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "pollar_user_id" DROP NOT NULL;
ALTER TABLE "user" ADD COLUMN "supabase_user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_supabase_user_id_key" ON "user"("supabase_user_id");
