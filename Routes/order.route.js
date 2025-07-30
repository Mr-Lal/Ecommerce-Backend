import express from "express";
import Order from "../models/order.model.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import io from "../server.js";
import { orderSchemaZod } from "../validator/order.validator.js";
import z from "zod";
import notificationModel from "../models/notification.model.js";

const orderRoute = express.Router();

orderRoute.post("/order", verifyToken, async (req, res) => {
  // Assuming you're inside an Express route handler:
  try {
    const {
      fullName,
      userName,
      companyName,
      country,
      apartment,
      city,
      state,
      zipCode,
      phone,
      email,
      orderNote,
      paymentMethod,
      shippingType,
      estimatedDelivery,
      address,
      items,
    } = req.body;
    const customer = req.user.id;
    const validatedData = orderSchemaZod.parse({
      fullName,
      userName,
      companyName,
      country,
      apartment,
      city,
      state,
      zipCode,
      phone,
      email,
      orderNote,
      paymentMethod,
      shippingType,
      orderNumber: "ORD-" + Date.now(),
      customer,
      streetAddress: address, // or map as needed
      estimatedDelivery,
      status: "Order Placed",
      items,
      trackingEvents: [
        {
          status: "Order Placed",
          description: "Your order has been placed.",
        },
      ],
    });

    const newOrder = new Order({
      ...validatedData,
      customer,
      trackingEvents: [
        {
          ...validatedData.trackingEvents?.[0],
          date: new Date().toLocaleDateString("en-US"),
          time: new Date().toLocaleTimeString("en-US"),
        },
      ],
      orderDate: new Date().toLocaleDateString("en-US"),
    });
    const newNotification = await notificationModel.create({
      message: `New order placed by ${req.user.email || "a customer"}`,
      orderId: newOrder._id,
    });
    io.emit("newOrderNotification", newNotification);

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.log(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

orderRoute.get("/order-user", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ customer: userId });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
orderRoute.get("/order", verifyToken, async (req, res) => {
  try {
    const { orderNumber } = req.query;

    if (!orderNumber) {
      return res.status(400).json({ error: "Order number is required" });
    }

    const orders = await Order.find({ orderNumber });

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const ids = orders.flatMap((item) => item.items);

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const products = await Product.find({ _id: { $in: objectIds } });

    res.status(200).json({ orders, products });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH update order status
orderRoute.patch("/status/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate("customer");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    const now = new Date();
    if (status === "Order Processed") order.statusHistory.processedAt = now;
    else if (status === "Shipped") order.statusHistory.shippedAt = now;
    else if (status === "Delivered") order.statusHistory.deliveredAt = now;

    await order.save(); // 🔥 important line to actually save the timestamps!

    // Send real-time notification
    io.to(order.customer.id).emit("orderStatusUpdated", {
      message: `Your order is now '${status}'`,
      status,
    });

    res.status(200).json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to update status",
      message: err.message,
    });
  }
});

orderRoute.get("/order/key", async (req, res) => {
  try {
    const { orderNumber } = req.body;
    if (!orderNumber) {
      return res.status(400).json({ error: "Order number is required" });
    }
    const order = await Order.find({ orderNumber });
    if (!order || order.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order by key" });
  }
});

orderRoute.get("/get-allOrders", async (req, res) => {
  try {
    const orders = await Order.find().populate("items status").exec();
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

orderRoute.delete("/delete-order/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    io.emit("orderDeleted", { message: "An order has been deleted", orderId });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default orderRoute;
