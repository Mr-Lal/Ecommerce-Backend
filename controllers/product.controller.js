import { uploadImages } from "../utils/handelImages.js";
import Product from "../models/product.model.js"

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      discountPrice,
      category,
      rating,
      shortDescription,
      longDescription,
      quantity,
      tag,
      discountPresent,
      stopwatch,
      brand,
      sku,
    } = req.body;

    if (!title || !price || !category || !quantity) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });
    }
    // Collect files from multer
    const files = [];
    if (req.files?.image1) files.push(req.files.image1[0]);
    if (req.files?.image2) files.push(req.files.image2[0]);
    if (req.files?.image3) files.push(req.files.image3[0]);

    const uploadedUrls = await uploadImages(files);

    const [image1, image2, image3] = uploadedUrls;

    const newProduct = new Product({
      title,
      price,
      discountPrice,
      category,
      rating,
      shortDescription,
      longDescription,
      quantity,
      tag,
      discountPresent,
      stopwatch,
      brand,
      sku,
      image1,
      image2,
      image3,
      user: req.user.id,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
