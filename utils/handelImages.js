import cloudinary from "./coludinary.js";
import fs from "fs";

export const uploadImages = async (files) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error("No files provided for upload");
    }

    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "images",
      });

      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error("Upload Error:", error);
    fs.unlinkSync(files);

    throw new Error("Failed to upload images");
  }
};
