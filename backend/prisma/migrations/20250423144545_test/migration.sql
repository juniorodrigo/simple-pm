/*
  Warnings:

  - You are about to drop the column `managerUserId` on the `ProjectActivity` table. All the data in the column will be lost.
  - Added the required column `assignedToUserId` to the `ProjectActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectActivity" DROP CONSTRAINT "ProjectActivity_managerUserId_fkey";

-- AlterTable
ALTER TABLE "ProjectActivity" DROP COLUMN "managerUserId",
ADD COLUMN     "assignedToUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
