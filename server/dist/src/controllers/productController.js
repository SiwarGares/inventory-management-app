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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString();
        const products = yield prisma.products.findMany({
            where: {
                name: {
                    contains: search,
                },
            },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category, brand, price, rating, stockEntries, // [{ warehouseId: "WH001", stockQuantity: 100 }, ...]
         } = req.body;
        // Step 1: Create the product
        const product = yield prisma.products.create({
            data: {
                name,
                category,
                brand,
                price,
                rating,
            },
        });
        // Step 2: Create entries in ProductWarehouse for each warehouse
        const warehousePromises = stockEntries.map((entry) => prisma.productWarehouse.create({
            data: {
                productId: product.productId,
                warehouseId: entry.warehouseId,
                stockQuantity: entry.stockQuantity,
            },
        }));
        yield Promise.all(warehousePromises);
        // Optional: fetch product with all warehouse stocks
        const fullProduct = yield prisma.products.findUnique({
            where: { productId: product.productId },
            include: { ProductWarehouse: true },
        });
        res.status(201).json(fullProduct);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product" });
    }
});
exports.createProduct = createProduct;
