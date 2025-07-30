import { z } from "zod";

const ContactValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, "Name must be at least 3 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Email is not correct")
    .min(13, "Email must be at least 13 characters"),
  subject: z
    .string({ required_error: "subject is required" })
    .trim()

    .min(5, "Subject must be at least 5 characters"),
  message: z.string().optional(),
});

export default ContactValidation;
