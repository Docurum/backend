/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `CategoriesOnComments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoriesOnTopics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnComments" DROP CONSTRAINT "CategoriesOnComments_assignedBy_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnComments" DROP CONSTRAINT "CategoriesOnComments_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnComments" DROP CONSTRAINT "CategoriesOnComments_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnTopics" DROP CONSTRAINT "CategoriesOnTopics_assignedBy_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnTopics" DROP CONSTRAINT "CategoriesOnTopics_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnTopics" DROP CONSTRAINT "CategoriesOnTopics_topicId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "categoryId",
ADD COLUMN     "categories" TEXT[];

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "categories" TEXT[];

-- DropTable
DROP TABLE "CategoriesOnComments";

-- DropTable
DROP TABLE "CategoriesOnTopics";
