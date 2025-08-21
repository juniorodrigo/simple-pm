-- AlterTable
ALTER TABLE "public"."ProjectStage" ADD COLUMN     "colorHex" TEXT NOT NULL DEFAULT '#000000',
ALTER COLUMN "color" DROP NOT NULL;
