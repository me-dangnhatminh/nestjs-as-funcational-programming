/*
  Warnings:

  - The primary key for the `file_in_folder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `file_in_folder` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "file_in_folder_file_id_key";

-- AlterTable
ALTER TABLE "file_in_folder" DROP CONSTRAINT "file_in_folder_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "file_in_folder_pkey" PRIMARY KEY ("file_id");
