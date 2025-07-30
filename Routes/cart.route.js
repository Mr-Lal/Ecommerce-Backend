import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import Cart from "../models/cart.model.js";

const cartRoute = express.Router();

cartRoute.post("/cart", verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      const existingProduct = cart.products.find(
        (p) => p.productId.toString() === productId
      );
      if (existingProduct) {
        existingProduct.quantity += quantity || 1;
      } else {
        cart.products.push({ productId, quantity });
      }
      await cart.save();
    } else {
      cart = await Cart.create({
        userId: req.user.id,
        products: [{ productId, quantity }],
      });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartRoute.get("/cart", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );
    if (!cart) return res.status(200).json({ products: [] });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartRoute.delete("/cart", verifyToken, async (req, res) => {
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // 🔍 Check: is it one ID or multiple?
    if (Array.isArray(productId)) {
      // 🟢 Multiple product IDs to remove
      cart.products = cart.products.filter(
        (p) => !productId.includes(p.productId.toString())
      );
      console.log("remove successful");
    } else {
      // 🟢 Single product ID to remove
      cart.products = cart.products.filter(
        (p) => p.productId.toString() !== productId
      );
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default cartRoute;
