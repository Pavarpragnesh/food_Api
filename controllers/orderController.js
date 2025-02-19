import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  try {

    // console.log(process.env.RAZORPAY_KEY_ID,process.env.RAZORPAY_KEY_SECRET)
    const { items, amount, address } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized. Please log in again.",
        });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.id;
      if (!userId) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Invalid token. Please log in again.",
          });
      }
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired. Please log in again.",
        });
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

    // ✅ Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(
        {
          amount: amount * 100,
          currency: "INR",
          receipt: newOrder._id.toString(),
          payment_capture: 1,
        },
        (err, order) => {
          console.log(err)
          if (!err) {
            res.status(200).send({
              success: true,
              msg: "Order Created",
              order_id: order.id,
              amount: amount,
              key_id: process.env.RAZORPAY_KEY_ID,
              product_name: req.body.name,
              description: req.body.description,
              contact: "8567345632",
              name: "Pragnesh",
              email: "patel@gmail.com",
            });
          } else {
            res
              .status(400)
              .send({ success: false, msg: "Something went wrong!" });
          }
        }
      );
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Payment gateway error. Please try again later.",
        });
    }

    return res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID,
      userId,
    });
  } catch (error) {
    console.error("Order Placement Error:", error);
    // return res.status(500).json({ success: false, message: "An unexpected error occurred while processing your order. Please try again later." });
  }
};

export { placeOrder };
