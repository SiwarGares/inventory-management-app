/*
  Warnings:

  - Added the required column `brand` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "brand" TEXT NOT NULL;
