import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    originalEmail:{
     type:String
    }
  },

  { timeseries: true }
);

const Contact = mongoose.model("contact", ContactSchema);

export default Contact;
