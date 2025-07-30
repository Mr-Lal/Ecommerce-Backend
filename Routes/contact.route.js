import express from "express";
import Contact from "../models/contact.model.js";
import z from "zod";
import ContactValidation from "../validator/contact.validator.js";
import { verifyToken } from "../middleware/verifyToken.js";
import notificationModel from "../models/notification.model.js";
import io from "../server.js";

const ContactRoute = express.Router();

ContactRoute.post("/contact-data", verifyToken,async (req, res) => {
  try {

    const result = ContactValidation.safeParse(req.body);

    


    if (!result.success) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        issues: result.error.errors,
      });
    }
   

    // ✅ If valid, use parsed data
    const { name, email, subject, message } = result.data;

    const userData=req.user
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  const user=req.user.email

    const ContactInfo = await Contact.create({
      name,
      email,
      subject,
      message,
      originalEmail:user
    });
        const newNotification = await notificationModel.create({
          message: `this user send a message ${user}`,
        });
        io.emit("newOrderNotification", newNotification);
    res.status(200).json({ message: "data send Successful", ContactInfo });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

export default ContactRoute;
