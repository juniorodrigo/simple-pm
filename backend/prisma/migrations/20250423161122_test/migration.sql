/*
  Warnings:

  - You are about to drop the column `projectId` on the `ProjectActivity` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `ProjectStage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectActivity" DROP CONSTRAINT "ProjectActivity_projectId_fkey";

-- AlterTable
ALTER TABLE "ProjectActivity" DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "ProjectStage" ADD COLUMN     "projectId" INTEGER NOT NULL;
