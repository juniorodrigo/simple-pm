/*
  Warnings:

  - The values [cancelled] on the enum `ActivityStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "ActivityPriority" ADD VALUE 'critical';

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityStatus_new" AS ENUM ('pending', 'in_progress', 'review', 'completed');
ALTER TABLE "ProjectActivity" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectStage" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectActivity" ALTER COLUMN "status" TYPE "ActivityStatus_new" USING ("status"::text::"ActivityStatus_new");
ALTER TABLE "ProjectStage" ALTER COLUMN "status" TYPE "ActivityStatus_new" USING ("status"::text::"ActivityStatus_new");
ALTER TYPE "ActivityStatus" RENAME TO "ActivityStatus_old";
ALTER TYPE "ActivityStatus_new" RENAME TO "ActivityStatus";
DROP TYPE "ActivityStatus_old";
ALTER TABLE "ProjectActivity" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "ProjectStage" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
