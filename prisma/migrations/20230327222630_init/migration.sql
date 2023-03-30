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
ALTER TABLE "Category" ADD COLUMN     "animation" JSONB,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "upvotes",
ADD COLUMN     "upvotes" TEXT[],
DROP COLUMN "downvotes",
ADD COLUMN     "downvotes" TEXT[],
DROP COLUMN "views",
ADD COLUMN     "views" TEXT[],
DROP COLUMN "shares",
ADD COLUMN     "shares" TEXT[];

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "upvotes",
ADD COLUMN     "upvotes" TEXT[],
DROP COLUMN "downvotes",
ADD COLUMN     "downvotes" TEXT[],
DROP COLUMN "views",
ADD COLUMN     "views" TEXT[],
DROP COLUMN "shares",
ADD COLUMN     "shares" TEXT[],
DROP COLUMN "commentCount",
ADD COLUMN     "commentCount" TEXT[];
