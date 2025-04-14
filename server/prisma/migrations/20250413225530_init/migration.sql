/*
  Warnings:

  - The values [ADMIN,STOCK_MANAGER,SUPPLIER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stockQuantity` on the `Products` table. All the data in the column will be lost.
  - Changed the type of `category` on the `ExpenseByCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `Expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `supplierId` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('Transport', 'Électricité', 'Maintenance', 'Assurance', 'Pertes');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('pending', 'completed', 'cancelled');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('admin', 'gestionnaireStock', 'operateur', 'fournisseur');
ALTER TABLE "Users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "ExpenseByCategory" DROP COLUMN "category",
ADD COLUMN     "category" "ExpenseCategory" NOT NULL;

-- AlterTable
ALTER TABLE "ExpenseSummary" ADD COLUMN     "changePercentage" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "description" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "ExpenseCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "stockQuantity";

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "supplierId" TEXT NOT NULL,
ADD COLUMN     "warehouseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "warehouseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Suppliers" (
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("supplierId")
);

-- CreateTable
CREATE TABLE "Warehouses" (
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouses_pkey" PRIMARY KEY ("warehouseId")
);

-- CreateTable
CREATE TABLE "WarehouseOperator" (
    "warehouseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WarehouseOperator_pkey" PRIMARY KEY ("warehouseId","userId")
);

-- CreateTable
CREATE TABLE "ProductWarehouse" (
    "product_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "stockQuantity" INTEGER NOT NULL,

    CONSTRAINT "ProductWarehouse_pkey" PRIMARY KEY ("product_id","warehouse_id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplierId" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'pending',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("purchaseOrderId")
);

-- CreateTable
CREATE TABLE "SalesByWarehouse" (
    "salesByWarehouseId" TEXT NOT NULL,
    "salesSummaryId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesByWarehouse_pkey" PRIMARY KEY ("salesByWarehouseId")
);

-- CreateTable
CREATE TABLE "PurchasesByWarehouse" (
    "purchasesByWarehouseId" TEXT NOT NULL,
    "purchaseSummaryId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "totalPurchased" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchasesByWarehouse_pkey" PRIMARY KEY ("purchasesByWarehouseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_email_key" ON "Suppliers"("email");

-- AddForeignKey
ALTER TABLE "Warehouses" ADD CONSTRAINT "Warehouses_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseOperator" ADD CONSTRAINT "WarehouseOperator_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseOperator" ADD CONSTRAINT "WarehouseOperator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWarehouse" ADD CONSTRAINT "ProductWarehouse_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWarehouse" ADD CONSTRAINT "ProductWarehouse_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesByWarehouse" ADD CONSTRAINT "SalesByWarehouse_salesSummaryId_fkey" FOREIGN KEY ("salesSummaryId") REFERENCES "SalesSummary"("salesSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesByWarehouse" ADD CONSTRAINT "SalesByWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasesByWarehouse" ADD CONSTRAINT "PurchasesByWarehouse_purchaseSummaryId_fkey" FOREIGN KEY ("purchaseSummaryId") REFERENCES "PurchaseSummary"("purchaseSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasesByWarehouse" ADD CONSTRAINT "PurchasesByWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouses"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;
