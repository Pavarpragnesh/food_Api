import express from "express";
import multer from "multer";
import { addFood,listFood,removeFood,updateFood,listFoodWithPagination   } from "../controllers/foodController.js";

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads", // Ensure this directory exists
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


foodRouter.post("/add", upload.single("image"), addFood);
// foodRouter.get("/list",listFood);
foodRouter.get("/list", listFoodWithPagination);
foodRouter.post("/remove",removeFood);
foodRouter.post("/update", upload.single("image"), updateFood); 

export default foodRouter;
