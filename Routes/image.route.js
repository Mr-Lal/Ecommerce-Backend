// routes/uploadRoute.js

import express from "express";
import multer from "multer";
import { uploadImages } from "../utils/handelImages.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // basic storage

router.post("/upload", upload.array("images", 3), async (req, res) => {
  try {
    const urls = await uploadImages(req.files);
    res.status(200).json({ urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
    
  }
});

export default router;
