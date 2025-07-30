import dotenv from "dotenv";
dotenv.config();
import express from "express";
import dbConnection from "./DB/dbConnection.js";
import router from "./Routes/image.route.js";
import AuthRoutes from "./Routes/auth/auth.route.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import productRoutes from "./Routes/product.route.js";
import simpleRoutes from "./Routes/simple.route.js";
import cartRoute from "./Routes/cart.route.js";
import orderRoute from "./Routes/order.route.js";
import ContactRoute from "./Routes/contact.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:5173","http://localhost:5174"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

dbConnection();
app.use("/api", router);
app.use("/api/auth", AuthRoutes);
app.use("/api", productRoutes);
app.use("/api", simpleRoutes);
app.use("/api", cartRoute);
app.use("/api", orderRoute);
app.use("/api", ContactRoute);

app.get("/", (req, res) => {
  res.send("working");
});
app.use((req, res, next) => {
  req.on("data", (chunk) => {
    console.log("Incoming chunk:", chunk.toString());
  });
  next();
});

export default app;
