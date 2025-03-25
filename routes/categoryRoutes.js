import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { addCategory, listCategories, updateCategory, removeCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

// Configure Multer for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
categoryRouter.post("/add", upload.single("image"),addCategory);
categoryRouter.post("/update", upload.single("image"),updateCategory);
categoryRouter.post("/remove",authMiddleware,removeCategory);
categoryRouter.get("/list",listCategories);

export default categoryRouter;
