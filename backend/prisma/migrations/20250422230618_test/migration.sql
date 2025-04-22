/*
  Warnings:

  - You are about to drop the column `manageruserId` on the `Project` table. All the data in the column will be lost.
  - Added the required column `managerUserId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_manageruserId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "manageruserId",
ADD COLUMN     "managerUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
