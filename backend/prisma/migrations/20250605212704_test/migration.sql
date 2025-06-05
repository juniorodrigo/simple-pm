-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "progressPercentage" INTEGER DEFAULT 0,
ADD COLUMN     "realEndDate" TIMESTAMP(6),
ADD COLUMN     "realStartDate" TIMESTAMP(6);
