import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:3000";
  try {
    const { items, amount, address } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in again." });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
      }
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      status: "Food Processing",
      payment: false,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // ✅ Create Razorpay Order properly
    let razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: newOrder._id.toString(),
      payment_capture: 1,
    });


    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID,
      success_url: `/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `/verify?success=false&orderId=${newOrder._id}`,
      userId,
    });

  } catch (error) {
    console.error("Order Placement Error:", error);
    return res.status(500).json({ success: false, message: "An unexpected error occurred while processing your order. Please try again later." });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  // console.log("Verifying order:", orderId, success);
  
  try {
    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }
    

    if (success === "true") {
       // Update order to mark payment as complete
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      // Delete order if payment failed
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//users orders for frontend
const userOrders = async (req,res) => {
  try {
    const orders = await orderModel.find({userId:req.body.userId});
    res.json({success:true,data:orders});
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    }else{
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// New function to fetch order details for printing
const printOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        userId: order.userId,
        items: order.items,
        amount: order.amount,
        address: order.address,
        status: order.status,
        payment: order.payment,
        date: order.date,
      },
    });
  } catch (error) {
    console.error("Print Order Error:", error);
    res.status(500).json({ success: false, message: "Error fetching order details" });
  }
};


export { placeOrder,verifyOrder,userOrders,listOrders,updateStatus,printOrder };
