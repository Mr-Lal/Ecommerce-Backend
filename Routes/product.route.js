import express from "express";
import { createProduct } from "../controllers/product.controller.js";
import multer from "multer";
import { uploadImages } from "../utils/handelImages.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Product from "../models/product.model.js";

const upload = multer({ dest: "uploads/" }); // basic storage

const router = express.Router();

router.post(
  "/product",
  verifyToken,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  createProduct
);

router.get("/product", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ msg: "product fetch successfully", products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ msg: "Product fetched successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

export default router;
