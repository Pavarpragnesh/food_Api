import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addTerms, getTerms, updateTerms, deleteTerms } from "../controllers/termsController.js";

const termsRouter = express.Router();

termsRouter.post("/add", authMiddleware, addTerms);
termsRouter.get("/list", getTerms);
termsRouter.post("/update", authMiddleware, updateTerms);
termsRouter.post("/delete", authMiddleware, deleteTerms);

export default termsRouter;