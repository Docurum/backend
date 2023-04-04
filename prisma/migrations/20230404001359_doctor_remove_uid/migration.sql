/*
  Warnings:

  - You are about to drop the column `uuid` on the `Doctor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Doctor_uuid_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "uuid";
