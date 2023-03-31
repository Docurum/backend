/*
  Warnings:

  - The `upvotes` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `downvotes` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `views` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `shares` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `upvotes` column on the `Topic` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `downvotes` column on the `Topic` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `views` column on the `Topic` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `shares` column on the `Topic` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `commentCount` column on the `Topic` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "upvotes",
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "downvotes",
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "views",
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "shares",
ADD COLUMN     "shares" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "upvotes",
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "downvotes",
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "views",
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "shares",
ADD COLUMN     "shares" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "commentCount",
ADD COLUMN     "commentCount" INTEGER NOT NULL DEFAULT 0;
