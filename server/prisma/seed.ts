import { PrismaClient, Prisma, PurchaseOrderStatus, ExpenseCategory, SupplierStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface JsonData {
  [key: string]: any;
}

async function clearData() {
  await prisma.$transaction([
    prisma.expenseByCategory.deleteMany(),
    prisma.expenseSummary.deleteMany(),
    prisma.salesByWarehouse.deleteMany(),
    prisma.purchasesByWarehouse.deleteMany(),
    prisma.salesSummary.deleteMany(),
    prisma.purchaseSummary.deleteMany(),
    prisma.expenses.deleteMany(),
    prisma.sales.deleteMany(),
    prisma.purchases.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.warehouseOperator.deleteMany(),
    prisma.productWarehouse.deleteMany(),
    prisma.products.deleteMany(),
    prisma.warehouses.deleteMany(),
    prisma.suppliers.deleteMany(),
    prisma.users.deleteMany(),
  ]);
  console.log("Cleared all data");
}

async function validateForeignKeys(data: JsonData[], modelName: string) {
  if (modelName === "purchaseOrder") {
    for (const item of data) {
      if (
        item.productId &&
        !(await prisma.products.findUnique({ where: { productId: item.productId } }))
      ) {
        throw new Error(`Invalid productId: ${item.productId}`);
      }
      if (
        item.warehouseId &&
        !(await prisma.warehouses.findUnique({ where: { warehouseId: item.warehouseId } }))
      ) {
        throw new Error(`Invalid warehouseId: ${item.warehouseId}`);
      }
      if (
        item.userId &&
        !(await prisma.users.findUnique({ where: { userId: item.userId } }))
      ) {
        throw new Error(`Invalid userId: ${item.userId}`);
      }
      if (
        item.supplierId &&
        !(await prisma.suppliers.findUnique({ where: { supplierId: item.supplierId } }))
      ) {
        throw new Error(`Invalid supplierId: ${item.supplierId}`);
      }
    }
  }
}

async function main() {
  try {
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
      const jsonData: JsonData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      await validateForeignKeys(jsonData, fileName.replace(".json", ""));

      // users.json
      if (fileName === "users.json") {
        const data: Prisma.UsersCreateManyInput[] = jsonData.map(d => ({
          userId: d.userId,
          name: d.name,
          email: d.email,
          role: d.role || "operateur",
          createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        }));
        await prisma.users.createMany({ data });
        console.log("Seeded users");
        continue;
      }

      // suppliers.json
      if (fileName === "suppliers.json") {
        const data: Prisma.SuppliersCreateManyInput[] = jsonData.map(d => ({
          supplierId: d.supplierId,
          name: d.name,
          email: d.email,
          status:
            (d.status === "actif"
              ? SupplierStatus.ACTIF
              : SupplierStatus.EN_ATTENTE),
          createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        }));
        await prisma.suppliers.createMany({ data });
        console.log("Seeded suppliers");
        continue;
      }

      // warehouses.json
      if (fileName === "warehouses.json") {
        const data: Prisma.WarehousesCreateManyInput[] = jsonData.map(d => ({
          warehouseId: d.warehouseId,
          name: d.name,
          location: d.location,
          managerId: d.managerId,
          createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        }));
        await prisma.warehouses.createMany({ data });
        console.log("Seeded warehouses");
        continue;
      }

      // warehouseOperator.json
      if (fileName === "warehouseOperator.json") {
        const data: Prisma.WarehouseOperatorCreateManyInput[] = jsonData.map(d => ({
          warehouseId: d.warehouseId,
          userId: d.userId,
        }));
        await prisma.warehouseOperator.createMany({ data });
        console.log("Seeded warehouse operators");
        continue;
      }

      // products.json
      if (fileName === "products.json") {
        const data: Prisma.ProductsCreateManyInput[] = jsonData.map(d => ({
          productId: d.productId,
          name: d.name,
          category: d.category,
          brand: d.brand,
          price: Number(d.price),
          rating: d.rating != null ? Number(d.rating) : undefined,
          createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        }));
        await prisma.products.createMany({ data });
        console.log("Seeded products");
        continue;
      }

      // productWarehouse.json
      if (fileName === "productWarehouse.json") {
        const data: Prisma.ProductWarehouseCreateManyInput[] = jsonData.map(d => ({
          productId: d.productId,
          warehouseId: d.warehouseId,
          stockQuantity: Number(d.stockQuantity),
        }));
        await prisma.productWarehouse.createMany({ data });
        console.log("Seeded product warehouses");
        continue;
      }

      // purchaseOrder.json
      if (fileName === "purchaseOrder.json") {
        const data: Prisma.PurchaseOrderCreateManyInput[] = jsonData.map(d => {
          const raw = (d.status as string)
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          let status: PurchaseOrderStatus;
          switch (raw) {
            case "EN_ATTENTE":
              status = PurchaseOrderStatus.EN_ATTENTE;
              break;
            case "EN_COURS":
              status = PurchaseOrderStatus.EN_COURS;
              break;
            case "LIVREE":
              status = PurchaseOrderStatus.LIVREE;
              break;
            case "ANNULEE":
              status = PurchaseOrderStatus.ANNULEE;
              break;
            default:
              throw new Error(`Invalid status: ${d.status}`);
          }
          return {
            purchaseOrderId: d.purchaseOrderId,
            productId: d.productId,
            warehouseId: d.warehouseId,
            userId: d.userId,
            supplierId: d.supplierId || null,
            quantity: Number(d.quantity),
            status,
            timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
            createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
            updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
          };
        });
        await prisma.purchaseOrder.createMany({ data });
        console.log("Seeded purchase orders");
        continue;
      }

      // sales.json
      if (fileName === "sales.json") {
        const data: Prisma.SalesCreateManyInput[] = jsonData.map(d => ({
          saleId: d.saleId,
          productId: d.productId,
          warehouseId: d.warehouseId,
          timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
          quantity: Number(d.quantity),
          unitPrice: Number(d.unitPrice),
          totalAmount: Number(d.quantity) * Number(d.unitPrice),
        }));
        await prisma.sales.createMany({ data });
        console.log("Seeded sales");
        continue;
      }

      // purchases.json
      if (fileName === "purchases.json") {
        const data: Prisma.PurchasesCreateManyInput[] = jsonData.map(d => ({
          purchaseId: d.purchaseId,
          productId: d.productId,
          warehouseId: d.warehouseId,
          supplierId: d.supplierId,
          timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
          quantity: Number(d.quantity),
          unitCost: Number(d.unitCost),
          totalCost: Number(d.quantity) * Number(d.unitCost),
        }));
        await prisma.purchases.createMany({ data });
        console.log("Seeded purchases");
        continue;
      }

      // expenses.json
      if (fileName === "expenses.json") {
        const data: Prisma.ExpensesCreateManyInput[] = jsonData.map(d => {
          let category: ExpenseCategory;
          switch (d.category) {
            case "Transport":
              category = ExpenseCategory.Transport;
              break;
            case "Électricité":
              category = ExpenseCategory.Électricité;
              break;
            case "Maintenance":
              category = ExpenseCategory.Maintenance;
              break;
            case "Assurance":
              category = ExpenseCategory.Assurance;
              break;
            case "Pertes":
              category = ExpenseCategory.Pertes;
              break;
            default:
              throw new Error(`Invalid expense category: ${d.category}`);
          }
          return {
            expenseId: d.expenseId,
            category,
            amount: Number(d.amount),
            description: d.description || undefined,
            timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
          };
        });
        await prisma.expenses.createMany({ data });
        console.log("Seeded expenses");
        continue;
      }

     // salesSummary.json
if (fileName === "salesSummary.json") {
  for (const s of jsonData) {
    const { byWarehouse, salesSummaryId, totalValue, changePercentage, date } = s as any;

    // Créer un résumé des ventes
    await prisma.salesSummary.create({
      data: {
        salesSummaryId,
        totalValue: Number(totalValue),
        changePercentage: changePercentage != null ? Number(changePercentage) : undefined,
        date: new Date(date),

        // Créer des ventes par entrepôt uniquement si 'byWarehouse' existe et n'est pas vide
        SalesByWarehouse: {
          create: byWarehouse?.length
            ? byWarehouse.map((bw: any) => ({
                salesByWarehouseId: bw.salesByWarehouseId,
                warehouseId: bw.warehouseId,
                totalValue: Number(bw.totalValue),
                date: new Date(bw.date),
              }))
            : [], // Si byWarehouse est vide ou non défini, on crée un tableau vide
        },
      },
    });
  }
  console.log("Seeded sales summaries");
  continue;
}


      // salesByWarehouse.json
      if (fileName === "salesByWarehouse.json") {
        const data: Prisma.SalesByWarehouseCreateManyInput[] = jsonData.map(d => ({
          salesByWarehouseId: d.salesByWarehouseId,
          salesSummaryId: d.salesSummaryId,
          warehouseId: d.warehouseId,
          totalValue: Number(d.totalValue),
          date: new Date(d.date),
        }));
        await prisma.salesByWarehouse.createMany({ data });
        console.log("Seeded sales by warehouse");
        continue;
      }

   // purchaseSummary.json
if (fileName === "purchaseSummary.json") {
  for (const s of jsonData) {
    const { byWarehouse, purchaseSummaryId, totalPurchased, changePercentage, date } = s as any;

    // Créer un résumé des achats
    await prisma.purchaseSummary.create({
      data: {
        purchaseSummaryId,
        totalPurchased: Number(totalPurchased),
        changePercentage: changePercentage != null ? Number(changePercentage) : undefined,
        date: new Date(date),

        // Créer des achats par entrepôt uniquement si 'byWarehouse' existe et n'est pas vide
        PurchasesByWarehouse: {
          create: byWarehouse?.length
            ? byWarehouse.map((bw: any) => ({
                purchasesByWarehouseId: bw.purchasesByWarehouseId,
                warehouseId: bw.warehouseId,
                totalPurchased: Number(bw.totalPurchased),
                date: new Date(bw.date),
              }))
            : [], // Si byWarehouse est vide ou non défini, on crée un tableau vide
        },
      },
    });
  }
  console.log("Seeded purchase summaries");
  continue;
}

      // purchasesByWarehouse.json
      if (fileName === "purchasesByWarehouse.json") {
        const data: Prisma.PurchasesByWarehouseCreateManyInput[] = jsonData.map(d => ({
          purchasesByWarehouseId: d.purchasesByWarehouseId,
          purchaseSummaryId: d.purchaseSummaryId,
          warehouseId: d.warehouseId,
          totalPurchased: Number(d.totalPurchased),
          date: new Date(d.date),
        }));
        await prisma.purchasesByWarehouse.createMany({ data });
        console.log("Seeded purchases by warehouse");
        continue;
      }

   // expenseSummary.json
if (fileName === "expenseSummary.json") {
  for (const s of jsonData) {
    const {
      categories,
      expenseSummaryId,
      totalExpenses,
      lastExpenseDate,
      numberOfExpenses,
      changePercentage,
      date,
    } = s as any;

    // Créer un résumé des dépenses
    await prisma.expenseSummary.create({
      data: {
        expenseSummaryId,
        totalExpenses: Number(totalExpenses),
        lastExpenseDate: lastExpenseDate ? new Date(lastExpenseDate) : undefined,
        numberOfExpenses: numberOfExpenses != null ? Number(numberOfExpenses) : undefined,
        changePercentage: changePercentage != null ? Number(changePercentage) : undefined,
        date: new Date(date),
        
        // Créer des dépenses par catégorie uniquement si 'categories' existe et n'est pas vide
        ExpenseByCategory: {
          create: categories?.length
            ? categories.map((cat: any) => ({
                expenseByCategoryId: cat.expenseByCategoryId,
                category: cat.category as ExpenseCategory,
                amount: Number(cat.amount),
                date: new Date(cat.date),
              }))
            : [], // Si categories est vide ou non défini, on crée un tableau vide
        },
      },
    });
  }
  console.log("Seeded expense summaries");
  continue;
}


      // expenseByCategory.json
      if (fileName === "expenseByCategory.json") {
        const data: Prisma.ExpenseByCategoryCreateManyInput[] = jsonData.map(d => ({
          expenseByCategoryId: d.expenseByCategoryId,
          expenseSummaryId: d.expenseSummaryId,
          category: d.category as ExpenseCategory,
          amount: Number(d.amount),
          date: new Date(d.date),
        }));
        await prisma.expenseByCategory.createMany({ data });
        console.log("Seeded expense by category");
        continue;
      }

      // fallback
      await model.createMany({ data: jsonData });
      console.log(`Seeded ${fileName}`);
    }

    // Recalculate stock quantities
    const purchasesAll = await prisma.purchases.findMany();
    const salesAll = await prisma.sales.findMany();
    const pwList = await prisma.productWarehouse.findMany();

    for (const { productId, warehouseId } of pwList) {
      const totalPurchased = purchasesAll
        .filter(p => p.productId === productId && p.warehouseId === warehouseId)
        .reduce((sum, p) => sum + p.quantity, 0);
      const totalSold = salesAll
        .filter(s => s.productId === productId && s.warehouseId === warehouseId)
        .reduce((sum, s) => sum + s.quantity, 0);

      await prisma.productWarehouse.update({
        where: { productId_warehouseId: { productId, warehouseId } },
        data: { stockQuantity: totalPurchased - totalSold },
      });
    }
    console.log("Recalculated stock quantities");
  } catch (error) {
    console.error("Error in main:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});