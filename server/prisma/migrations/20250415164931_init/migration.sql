/*
  Warnings:

  - The primary key for the `ProductWarehouse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `ProductWarehouse` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_id` on the `ProductWarehouse` table. All the data in the column will be lost.
  - Added the required column `productId` to the `ProductWarehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `ProductWarehouse` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Suppliers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('actif', 'en_attente');

-- DropForeignKey
ALTER TABLE "ProductWarehouse" DROP CONSTRAINT "ProductWarehouse_product_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductWarehouse" DROP CONSTRAINT "ProductWarehouse_warehouse_id_fkey";

-- AlterTable
ALTER TABLE "ProductWarehouse" DROP CONSTRAINT "ProductWarehouse_pkey",
DROP COLUMN "product_id",
DROP COLUMN "warehouse_id",
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "warehouseId" TEXT NOT NULL,
ADD CONSTRAINT "ProductWarehouse_pkey" PRIMARY KEY ("productId", "warehouseId");

-- AlterTable
ALTER TABLE "Suppliers" DROP COLUMN "status",
ADD COLUMN     "status" "SupplierStatus" NOT NULL;

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "ProductWarehouse" ADD CONSTRAINT "ProductWarehouse_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWarehouse" ADD CONSTRAINT "ProductWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;
