import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      category,
      brand,
      price,
      rating,
      stockEntries, // [{ warehouseId: "WH001", stockQuantity: 100 }, ...]
    } = req.body;

    // Step 1: Create the product
    const product = await prisma.products.create({
      data: {
        name,
        category,
        brand,
        price,
        rating,
      },
    });

    // Step 2: Create entries in ProductWarehouse for each warehouse
    const warehousePromises = stockEntries.map((entry: { warehouseId: string, stockQuantity: number }) =>
      prisma.productWarehouse.create({
        data: {
          productId: product.productId,
          warehouseId: entry.warehouseId,
          stockQuantity: entry.stockQuantity,
        },
      })
    );

    await Promise.all(warehousePromises);

    // Optional: fetch product with all warehouse stocks
    const fullProduct = await prisma.products.findUnique({
      where: { productId: product.productId },
      include: { ProductWarehouse: true },
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

