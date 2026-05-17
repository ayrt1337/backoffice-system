/*
  Warnings:

  - You are about to drop the column `resourceId` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `resource` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_resourceId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "resourceId",
ADD COLUMN     "resource" TEXT NOT NULL;
