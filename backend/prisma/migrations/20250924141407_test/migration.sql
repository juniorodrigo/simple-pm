/*
  Warnings:

  - The `todoList` column on the `ProjectActivity` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProjectActivity" ADD COLUMN     "changesHistory" JSONB[],
DROP COLUMN "todoList",
ADD COLUMN     "todoList" JSONB[];
