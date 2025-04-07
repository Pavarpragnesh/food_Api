import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import 'dotenv/config.js'
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRouter from "./routes/categoryRoutes.js";
import termsRouter from "./routes/termsRouter.js";
import offerRouter from "./routes/offerRouter.js";

//app config
const app = express()
const port = 5001

//middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

//api endpoints
app.use("/api/food",foodRouter);
app.use("/images",express.static('uploads'));
app.use("/uploads", express.static("uploads"));
app.use("/api/user",userRouter);
app.use("/api/cart",cartRouter);
app.use("/api/order",orderRouter);
app.use("/api/category", categoryRouter);
app.use("/api/terms", termsRouter);
app.use("/api/offer", offerRouter);

app.get("/",(req,res)=>{
  res.send("API Working")
})

app.listen(port,()=>{
  console.log(`Server Started on http://localhost:${port}`);
})


// mongodb+srv://pavarpragnesh23:Pavar07@cluster0.nxaax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0