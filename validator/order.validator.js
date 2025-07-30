import { z } from "zod";

export const orderSchemaZod = z.object({
  fullName: z.string().min(1, "Full name is required"),
  userName: z.string().optional(),
  companyName: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  phone: z.string().min(10, "Phone Number at least 10"),
  email: z.string().email().optional(),
  orderNote: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  shippingType: z.string().optional(),
  orderNumber: z.string().optional(),
  customer: z.string().optional(), // ObjectId as string
  streetAddress: z.string().optional(),
  status: z
    .enum(["Order Placed", "Order Processed", "Shipped", "Delivered"])
    .optional(),
  estimatedDelivery: z.string().optional(),
  items: z.array(z.string()).optional(), // Array of Product ObjectIds
  trackingEvents: z
    .array(
      z.object({
        status: z.string(),
        description: z.string(),
      })
    )
    .optional(),
});
