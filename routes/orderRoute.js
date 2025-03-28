import express from "express";
import authMiddleware from "../middleware/auth.js"
import { placeOrder, verifyOrder ,userOrders,listOrders,updateStatus,printOrder,acceptOrder,getTopOrderedDishes } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.get('/list',authMiddleware,listOrders);
orderRouter.post('/status',authMiddleware,updateStatus);
orderRouter.get("/print/:orderId", printOrder);
orderRouter.post("/accept", authMiddleware, acceptOrder);
orderRouter.get("/top-ordered-dishes", getTopOrderedDishes);
export default orderRouter;