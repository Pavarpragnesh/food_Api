import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { addFood,listFood,removeFood,updateFood,listFoodWithPagination, rateFood   } from "../controllers/foodController.js";

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads", // Ensure this directory exists
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


foodRouter.post("/add", upload.single("image"), authMiddleware,addFood);
 foodRouter.get("/list1",listFood);
foodRouter.get("/list", listFoodWithPagination);
foodRouter.post("/remove",authMiddleware,removeFood);
foodRouter.post("/update", upload.single("image"),authMiddleware,updateFood);
foodRouter.post("/rate", authMiddleware, rateFood); // New rating route 

export default foodRouter;
