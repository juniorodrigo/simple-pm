/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `ProjectActivity` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProjectActivity` table. All the data in the column will be lost.
  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `managerUserId` to the `ProjectActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ProjectActivity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('manager', 'member');

-- AlterTable
ALTER TABLE "ProjectActivity" DROP COLUMN "assignedTo",
DROP COLUMN "name",
ADD COLUMN     "managerUserId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_pkey",
ADD COLUMN     "role" "ProjectRole" NOT NULL DEFAULT 'member',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProjectMember_id_seq";

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ProjectStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
