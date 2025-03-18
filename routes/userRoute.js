import express from "express";
import { loginUser,registerUser,listUsers,deleteUser,editUser  } from "../controllers/userController.js";
import multer from "multer";

const userRouter = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

userRouter.post("/register", upload.single("photo"), registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/list", listUsers); 
userRouter.delete("/delete/:id", deleteUser);
userRouter.put("/edit/:id", upload.single("photo"), editUser);

export default userRouter;