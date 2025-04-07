import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addOffer, listOffers, updateOffer, removeOffer } from "../controllers/offerController.js";

const offerRouter = express.Router();

// Routes
offerRouter.post("/add", authMiddleware, addOffer);
offerRouter.get("/list", listOffers);
offerRouter.post("/update", authMiddleware, updateOffer);
offerRouter.delete("/remove", authMiddleware, removeOffer);

export default offerRouter;