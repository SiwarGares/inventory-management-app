"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function clearData() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.$transaction([
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
    });
}
function validateForeignKeys(data, modelName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (modelName === "purchaseOrder") {
            for (const item of data) {
                if (item.productId &&
                    !(yield prisma.products.findUnique({ where: { productId: item.productId } }))) {
                    throw new Error(`Invalid productId: ${item.productId}`);
                }
                if (item.warehouseId &&
                    !(yield prisma.warehouses.findUnique({ where: { warehouseId: item.warehouseId } }))) {
                    throw new Error(`Invalid warehouseId: ${item.warehouseId}`);
                }
                if (item.userId &&
                    !(yield prisma.users.findUnique({ where: { userId: item.userId } }))) {
                    throw new Error(`Invalid userId: ${item.userId}`);
                }
                if (item.supplierId &&
                    !(yield prisma.suppliers.findUnique({ where: { supplierId: item.supplierId } }))) {
                    throw new Error(`Invalid supplierId: ${item.supplierId}`);
                }
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield clearData();
            const basePath = path_1.default.join(__dirname, "seedData");
            const seedFiles = [
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
                const filePath = path_1.default.join(basePath, fileName);
                const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
                yield validateForeignKeys(jsonData, fileName.replace(".json", ""));
                // users.json
                if (fileName === "users.json") {
                    const data = jsonData.map(d => ({
                        userId: d.userId,
                        name: d.name,
                        email: d.email,
                        role: d.role || "operateur",
                        createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
                        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
                    }));
                    yield prisma.users.createMany({ data });
                    console.log("Seeded users");
                    continue;
                }
                // suppliers.json
                if (fileName === "suppliers.json") {
                    const data = jsonData.map(d => ({
                        supplierId: d.supplierId,
                        name: d.name,
                        email: d.email,
                        status: (d.status === "actif"
                            ? client_1.SupplierStatus.ACTIF
                            : client_1.SupplierStatus.EN_ATTENTE),
                        createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
                        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
                    }));
                    yield prisma.suppliers.createMany({ data });
                    console.log("Seeded suppliers");
                    continue;
                }
                // warehouses.json
                if (fileName === "warehouses.json") {
                    const data = jsonData.map(d => ({
                        warehouseId: d.warehouseId,
                        name: d.name,
                        location: d.location,
                        managerId: d.managerId,
                        createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
                        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
                    }));
                    yield prisma.warehouses.createMany({ data });
                    console.log("Seeded warehouses");
                    continue;
                }
                // warehouseOperator.json
                if (fileName === "warehouseOperator.json") {
                    const data = jsonData.map(d => ({
                        warehouseId: d.warehouseId,
                        userId: d.userId,
                    }));
                    yield prisma.warehouseOperator.createMany({ data });
                    console.log("Seeded warehouse operators");
                    continue;
                }
                // products.json
                if (fileName === "products.json") {
                    const data = jsonData.map(d => ({
                        productId: d.productId,
                        name: d.name,
                        category: d.category,
                        brand: d.brand,
                        price: Number(d.price),
                        rating: d.rating != null ? Number(d.rating) : undefined,
                        createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
                        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
                    }));
                    yield prisma.products.createMany({ data });
                    console.log("Seeded products");
                    continue;
                }
                // productWarehouse.json
                if (fileName === "productWarehouse.json") {
                    const data = jsonData.map(d => ({
                        productId: d.productId,
                        warehouseId: d.warehouseId,
                        stockQuantity: Number(d.stockQuantity),
                    }));
                    yield prisma.productWarehouse.createMany({ data });
                    console.log("Seeded product warehouses");
                    continue;
                }
                // purchaseOrder.json
                if (fileName === "purchaseOrder.json") {
                    const data = jsonData.map(d => {
                        const raw = d.status
                            .toUpperCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "");
                        let status;
                        switch (raw) {
                            case "EN_ATTENTE":
                                status = client_1.PurchaseOrderStatus.EN_ATTENTE;
                                break;
                            case "EN_COURS":
                                status = client_1.PurchaseOrderStatus.EN_COURS;
                                break;
                            case "LIVREE":
                                status = client_1.PurchaseOrderStatus.LIVREE;
                                break;
                            case "ANNULEE":
                                status = client_1.PurchaseOrderStatus.ANNULEE;
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
                    yield prisma.purchaseOrder.createMany({ data });
                    console.log("Seeded purchase orders");
                    continue;
                }
                // sales.json
                if (fileName === "sales.json") {
                    const data = jsonData.map(d => ({
                        saleId: d.saleId,
                        productId: d.productId,
                        warehouseId: d.warehouseId,
                        timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
                        quantity: Number(d.quantity),
                        unitPrice: Number(d.unitPrice),
                        totalAmount: Number(d.quantity) * Number(d.unitPrice),
                    }));
                    yield prisma.sales.createMany({ data });
                    console.log("Seeded sales");
                    continue;
                }
                // purchases.json
                if (fileName === "purchases.json") {
                    const data = jsonData.map(d => ({
                        purchaseId: d.purchaseId,
                        productId: d.productId,
                        warehouseId: d.warehouseId,
                        supplierId: d.supplierId,
                        timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
                        quantity: Number(d.quantity),
                        unitCost: Number(d.unitCost),
                        totalCost: Number(d.quantity) * Number(d.unitCost),
                    }));
                    yield prisma.purchases.createMany({ data });
                    console.log("Seeded purchases");
                    continue;
                }
                // expenses.json
                if (fileName === "expenses.json") {
                    const data = jsonData.map(d => {
                        let category;
                        switch (d.category) {
                            case "Transport":
                                category = client_1.ExpenseCategory.Transport;
                                break;
                            case "Électricité":
                                category = client_1.ExpenseCategory.Électricité;
                                break;
                            case "Maintenance":
                                category = client_1.ExpenseCategory.Maintenance;
                                break;
                            case "Assurance":
                                category = client_1.ExpenseCategory.Assurance;
                                break;
                            case "Pertes":
                                category = client_1.ExpenseCategory.Pertes;
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
                    yield prisma.expenses.createMany({ data });
                    console.log("Seeded expenses");
                    continue;
                }
                // salesSummary.json
                if (fileName === "salesSummary.json") {
                    for (const s of jsonData) {
                        const { byWarehouse, salesSummaryId, totalValue, changePercentage, date } = s;
                        // Créer un résumé des ventes
                        yield prisma.salesSummary.create({
                            data: {
                                salesSummaryId,
                                totalValue: Number(totalValue),
                                changePercentage: changePercentage != null ? Number(changePercentage) : undefined,
                                date: new Date(date),
                                // Créer des ventes par entrepôt uniquement si 'byWarehouse' existe et n'est pas vide
                                SalesByWarehouse: {
                                    create: (byWarehouse === null || byWarehouse === void 0 ? void 0 : byWarehouse.length)
                                        ? byWarehouse.map((bw) => ({
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
                    const data = jsonData.map(d => ({
                        salesByWarehouseId: d.salesByWarehouseId,
                        salesSummaryId: d.salesSummaryId,
                        warehouseId: d.warehouseId,
                        totalValue: Number(d.totalValue),
                        date: new Date(d.date),
                    }));
                    yield prisma.salesByWarehouse.createMany({ data });
                    console.log("Seeded sales by warehouse");
                    continue;
                }
                // purchaseSummary.json
                if (fileName === "purchaseSummary.json") {
                    for (const s of jsonData) {
                        const { byWarehouse, purchaseSummaryId, totalPurchased, changePercentage, date } = s;
                        // Créer un résumé des achats
                        yield prisma.purchaseSummary.create({
                            data: {
                                purchaseSummaryId,
                                totalPurchased: Number(totalPurchased),
                                changePercentage: changePercentage != null ? Number(changePercentage) : undefined,
                                date: new Date(date),
                                // Créer des achats par entrepôt uniquement si 'byWarehouse' existe et n'est pas vide
                                PurchasesByWarehouse: {
                                    create: (byWarehouse === null || byWarehouse === void 0 ? void 0 : byWarehouse.length)
                                        ? byWarehouse.map((bw) => ({
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
                    const data = jsonData.map(d => ({
                        purchasesByWarehouseId: d.purchasesByWarehouseId,
                        purchaseSummaryId: d.purchaseSummaryId,
                        warehouseId: d.warehouseId,
                        totalPurchased: Number(d.totalPurchased),
                        date: new Date(d.date),
                    }));
                    yield prisma.purchasesByWarehouse.createMany({ data });
                    console.log("Seeded purchases by warehouse");
                    continue;
                }
                // expenseSummary.json
                if (fileName === "expenseSummary.json") {
                    for (const s of jsonData) {
                        const { categories, expenseSummaryId, totalExpenses, lastExpenseDate, numberOfExpenses, changePercentage, date, } = s;
                        // Créer un résumé des dépenses
                        yield prisma.expenseSummary.create({
                            data: {
                                expenseSummaryId,
                                totalExpenses: Number(totalExpenses),
                                lastExpenseDate: lastExpenseDate ? new Date(lastExpenseDate) : undefined,
                                numberOfExpenses: numberOfExpenses != null ? Number(numberOfExpenses) : undefined,
                                changePercentage: changePercentage != null ? Number(changePercentage) : undefined,
                                date: new Date(date),
                                // Créer des dépenses par catégorie uniquement si 'categories' existe et n'est pas vide
                                ExpenseByCategory: {
                                    create: (categories === null || categories === void 0 ? void 0 : categories.length)
                                        ? categories.map((cat) => ({
                                            expenseByCategoryId: cat.expenseByCategoryId,
                                            category: cat.category,
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
                    const data = jsonData.map(d => ({
                        expenseByCategoryId: d.expenseByCategoryId,
                        expenseSummaryId: d.expenseSummaryId,
                        category: d.category,
                        amount: Number(d.amount),
                        date: new Date(d.date),
                    }));
                    yield prisma.expenseByCategory.createMany({ data });
                    console.log("Seeded expense by category");
                    continue;
                }
                // fallback
                yield model.createMany({ data: jsonData });
                console.log(`Seeded ${fileName}`);
            }
            // Recalculate stock quantities
            const purchasesAll = yield prisma.purchases.findMany();
            const salesAll = yield prisma.sales.findMany();
            const pwList = yield prisma.productWarehouse.findMany();
            for (const { productId, warehouseId } of pwList) {
                const totalPurchased = purchasesAll
                    .filter(p => p.productId === productId && p.warehouseId === warehouseId)
                    .reduce((sum, p) => sum + p.quantity, 0);
                const totalSold = salesAll
                    .filter(s => s.productId === productId && s.warehouseId === warehouseId)
                    .reduce((sum, s) => sum + s.quantity, 0);
                yield prisma.productWarehouse.update({
                    where: { productId_warehouseId: { productId, warehouseId } },
                    data: { stockQuantity: totalPurchased - totalSold },
                });
            }
            console.log("Recalculated stock quantities");
        }
        catch (error) {
            console.error("Error in main:", error);
            throw error;
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main().catch(e => {
    console.error("Fatal error:", e);
    process.exit(1);
});
