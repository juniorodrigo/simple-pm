/*
  Warnings:

  - The values [yellow,purple,orange,pink,brown,white,cyan,coral] on the enum `Colors` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Colors_new" AS ENUM ('red', 'green', 'blue', 'amber', 'violet', 'rose', 'gray');
ALTER TABLE "ProjectCategory" ALTER COLUMN "color" DROP DEFAULT;
ALTER TABLE "ProjectCategory" ALTER COLUMN "color" TYPE "Colors_new" USING ("color"::text::"Colors_new");
ALTER TYPE "Colors" RENAME TO "Colors_old";
ALTER TYPE "Colors_new" RENAME TO "Colors";
DROP TYPE "Colors_old";
ALTER TABLE "ProjectCategory" ALTER COLUMN "color" SET DEFAULT 'blue';
COMMIT;
