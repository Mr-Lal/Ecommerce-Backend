import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    companyName: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    apartment: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    orderNote: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingType: {
      type: String,
    },
    orderNumber: String,
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    streetAddress: String,
    status: {
      type: String,
      enum: ["Order Placed", "Order Processed", "Shipped", "Delivered"],
      default: "Order Placed",
    },
    statusHistory: {
      placedAt: Date,
      processedAt: Date,
      shippedAt: Date,
      deliveredAt: Date,
    },
    estimatedDelivery: String,
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    trackingEvents: [
      {
        status: String,
        description: String,
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
