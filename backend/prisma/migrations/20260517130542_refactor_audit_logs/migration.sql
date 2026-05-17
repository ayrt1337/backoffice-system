/*
  Warnings:

  - You are about to drop the column `newValue` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `oldValue` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `resourceItem` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `audit_logs` table. All the data in the column will be lost.
  - Made the column `ip` on table `audit_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "newValue",
DROP COLUMN "oldValue",
DROP COLUMN "resourceItem",
DROP COLUMN "userId",
ADD COLUMN     "author" JSONB,
ADD COLUMN     "newItem" JSONB,
ADD COLUMN     "targetItem" JSONB,
ALTER COLUMN "ip" SET NOT NULL;
