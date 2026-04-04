/*
  Warnings:

  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permissionId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actionId` to the `role_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
DROP COLUMN "permissionId",
ADD COLUMN     "actionId" TEXT NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId", "actionId");

-- DropTable
DROP TABLE "permissions";

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actions_slug_key" ON "actions"("slug");

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
