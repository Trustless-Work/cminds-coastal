-- AlterEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "auth_providers" "AuthProvider"[] DEFAULT ARRAY[]::"AuthProvider"[];
