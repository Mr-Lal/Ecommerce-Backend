import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(
      process.env.URI
    )
    console.log(" DB Connected")
  } catch (error) {
    console.log(error);
    
    console.log("connection not successful");
  }
};

export default dbConnection;
