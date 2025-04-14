import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function clearData() {
  await prisma.expenseByCategory.deleteMany();
  console.log("Cleared data from ExpenseByCategory");

  await prisma.expenseSummary.deleteMany();
  console.log("Cleared data from ExpenseSummary");

  await prisma.expenses.deleteMany();
  console.log("Cleared data from Expenses");

  await prisma.salesByWarehouse.deleteMany();
  console.log("Cleared data from SalesByWarehouse");

  await prisma.purchasesByWarehouse.deleteMany();
  console.log("Cleared data from PurchasesByWarehouse");

  await prisma.sales.deleteMany();
  console.log("Cleared data from Sales");

  await prisma.salesSummary.deleteMany();
  console.log("Cleared data from SalesSummary");

  await prisma.purchases.deleteMany();
  console.log("Cleared data from Purchases");

  await prisma.purchaseSummary.deleteMany();
  console.log("Cleared data from PurchaseSummary");

  await prisma.purchaseOrder.deleteMany();
  console.log("Cleared data from PurchaseOrder");

  await prisma.warehouseOperator.deleteMany();
  console.log("Cleared data from WarehouseOperator");

  await prisma.productWarehouse.deleteMany();
  console.log("Cleared data from ProductWarehouse");

  await prisma.products.deleteMany();
  console.log("Cleared data from Products");

  await prisma.warehouses.deleteMany();
  console.log("Cleared data from Warehouses");

  await prisma.suppliers.deleteMany();
  console.log("Cleared data from Suppliers");

  await prisma.users.deleteMany();
  console.log("Cleared data from Users");
}

async function main() {
  await clearData();

  const basePath = path.join(__dirname, "seedData");

  const seedFiles: { fileName: string; model: any }[] = [
    { fileName: "users.json", model: prisma.users },
    { fileName: "suppliers.json", model: prisma.suppliers },
    { fileName: "warehouses.json", model: prisma.warehouses },
    { fileName: "warehouseOperator.json", model: prisma.warehouseOperator },
    { fileName: "products.json", model: prisma.products },
    { fileName: "productWarehouse.json", model: prisma.productWarehouse },
    { fileName: "purchaseOrder.json", model: prisma.purchaseOrder },
    { fileName: "sales.json", model: prisma.sales },
    { fileName: "purchases.json", model: prisma.purchases },
    { fileName: "expenses.json", model: prisma.expenses },
    { fileName: "salesSummary.json", model: prisma.salesSummary },
    { fileName: "salesByWarehouse.json", model: prisma.salesByWarehouse },
    { fileName: "purchaseSummary.json", model: prisma.purchaseSummary },
    { fileName: "purchasesByWarehouse.json", model: prisma.purchasesByWarehouse },
    { fileName: "expenseSummary.json", model: prisma.expenseSummary },
    { fileName: "expenseByCategory.json", model: prisma.expenseByCategory },
  ];

  for (const { fileName, model } of seedFiles) {
    const filePath = path.join(basePath, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (fileName === "products.json") {
      const productsData = jsonData.map((data: any) => ({
        productId: data.productId,
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: data.price,
        rating: data.rating,
      }));
      await model.createMany({ data: productsData });
      console.log(`Seeded products with data from ${fileName}`);
      continue;
    }

    if (fileName === "sales.json") {
      const salesData = jsonData.map((data: any) => ({
        saleId: data.saleId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalAmount: data.quantity * data.unitPrice,
        timestamp: new Date(data.timestamp),
      }));
      await model.createMany({ data: salesData });
      console.log(`Seeded sales with data from ${fileName}`);
      continue;
    }

    if (fileName === "purchases.json") {
      const purchasesData = jsonData.map((data: any) => ({
        purchaseId: data.purchaseId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        supplierId: data.supplierId,
        quantity: data.quantity,
        unitCost: data.unitCost,
        totalCost: data.quantity * data.unitCost,
        timestamp: new Date(data.timestamp),
      }));
      await model.createMany({ data: purchasesData });
      console.log(`Seeded purchases with data from ${fileName}`);
      continue;
    }

    if (fileName === "purchaseOrder.json") {
      const purchaseOrderData = jsonData.map((data: any) => ({
        purchaseOrderId: data.purchaseOrderId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        userId: data.userId,
        supplierId: data.supplierId || null,
        quantity: data.quantity,
        status: data.status,
        timestamp: new Date(data.timestamp),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }));
      await model.createMany({ data: purchaseOrderData });
      console.log(`Seeded purchaseOrder with data from ${fileName}`);
      continue;
    }

    if (fileName === "expenseSummary.json") {
      for (const summary of jsonData) {
        const { categories, ...summaryData } = summary;
        await model.create({
          data: {
            ...summaryData,
            date: new Date(summaryData.date),
            lastExpenseDate: summaryData.lastExpenseDate
              ? new Date(summaryData.lastExpenseDate)
              : null,
            ExpenseByCategory: {
              create: categories.map((cat: any) => ({
                expenseByCategoryId: cat.expenseByCategoryId,
                category: cat.category,
                amount: cat.amount,
                date: new Date(cat.date),
              })),
            },
          },
        });
      }
      console.log(`Seeded expenseSummary with data from ${fileName}`);
      continue;
    }

    if (fileName === "salesSummary.json") {
      for (const summary of jsonData) {
        const { byWarehouse, ...summaryData } = summary;
        await model.create({
          data: {
            ...summaryData,
            date: new Date(summaryData.date),
            SalesByWarehouse: {
              create: byWarehouse.map((bw: any) => ({
                salesByWarehouseId: bw.salesByWarehouseId,
                warehouseId: bw.warehouseId,
                totalValue: bw.totalValue,
                date: new Date(bw.date),
              })),
            },
          },
        });
      }
      console.log(`Seeded salesSummary with data from ${fileName}`);
      continue;
    }

    if (fileName === "purchaseSummary.json") {
      for (const summary of jsonData) {
        const { byWarehouse, ...summaryData } = summary;
        await model.create({
          data: {
            ...summaryData,
            date: new Date(summaryData.date),
            PurchasesByWarehouse: {
              create: byWarehouse.map((bw: any) => ({
                purchasesByWarehouseId: bw.purchasesByWarehouseId,
                warehouseId: bw.warehouseId,
                totalPurchased: bw.totalPurchased,
                date: new Date(bw.date),
              })),
            },
          },
        });
      }
      console.log(`Seeded purchaseSummary with data from ${fileName}`);
      continue;
    }

    if (fileName === "expenses.json") {
      const expensesData = jsonData.map((data: any) => ({
        ...data,
        timestamp: new Date(data.timestamp),
      }));
      await model.createMany({ data: expensesData });
      console.log(`Seeded expenses with data from ${fileName}`);
      continue;
    }

    if (fileName === "expenseByCategory.json") {
      const expenseByCategoryData = jsonData.map((data: any) => ({
        ...data,
        date: new Date(data.date),
      }));
      await model.createMany({ data: expenseByCategoryData });
      console.log(`Seeded expenseByCategory with data from ${fileName}`);
      continue;
    }

    if (
      [
        "users.json",
        "suppliers.json",
        "warehouses.json",
        "warehouseOperator.json",
        "productWarehouse.json",
        "salesByWarehouse.json",
        "purchasesByWarehouse.json",
      ].includes(fileName)
    ) {
      const dataWithDates = jsonData.map((data: any) => ({
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.createdAt ? { createdAt: new Date(data.createdAt) } : {}),
        ...(data.updatedAt ? { updatedAt: new Date(data.updatedAt) } : {}),
      }));
      await model.createMany({ data: dataWithDates });
      console.log(`Seeded data from ${fileName}`);
      continue;
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });