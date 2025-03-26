import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js"; 
import fs from "fs";
import jwt from "jsonwebtoken";

// Add food item
const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await food.save();
      res.json({ success: true, message: "Food Added" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


// Update food item
const updateFood = async (req, res) => {
  try {
    const { id, userId } = req.body; // Extract userId from request body

    // Check if user is an admin
    const userData = await userModel.findById(userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not an admin" });
    }

    // Find the food item
    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // Remove old image if a new one is uploaded
    if (req.file) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.error("Error deleting old image:", err);
      });
      food.image = req.file.filename;
    }

    // Update food details
    food.name = req.body.name || food.name;
    food.description = req.body.description || food.description;
    food.price = req.body.price || food.price;
    food.category = req.body.category || food.category;

    await food.save();

    res.json({ success: true, message: "Food Updated Successfully.", food });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating food item", error });
  }
};

//all food list
const listFood = async (req,res) => {
  try{
    const foods =await foodModel.find({});
    res.json({success:true,data:foods}) 
  }catch(error){
    console.log(error);
    res.status(500).json({ success: false, message: "Error", error });
    
  }
}

// List food with pagination
const listFoodWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const foods = await foodModel.find({}).skip(skip).limit(limit);
    const total = await foodModel.countDocuments();

    res.json({
      success: true,
      data: foods,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};


//remove food item
const removeFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      fs.unlink(`uploads/${food.image}`, () => {});
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Food Removed" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Rate food items
const rateFood = async (req, res) => {
  try {
    const { orderId, ratings } = req.body; // ratings is an object: { foodId: rating }
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify user from token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Invalid token." });
      }
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    // Validate input
    if (!orderId || !ratings || Object.keys(ratings).length === 0) {
      return res.status(400).json({ success: false, message: "Order ID and ratings are required." });
    }

    // Check if the order exists and belongs to the user
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (order.userId !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to rate this order." });
    }
    if (order.status.toLowerCase() !== "delivered") {
      return res.status(400).json({ success: false, message: "Only delivered orders can be rated." });
    }

    // Validate and update food ratings
    const foodIds = Object.keys(ratings);
    for (const foodId of foodIds) {
      const rating = ratings[foodId];
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: `Rating for ${foodId} must be an integer between 1 and 5.` });
      }

      // Check if the food item exists in the order
      const foodInOrder = order.items.find((item) => item._id === foodId || `${orderId}-${order.items.indexOf(item)}` === foodId);
      if (!foodInOrder) {
        return res.status(400).json({ success: false, message: `Food item ${foodId} not found in this order.` });
      }

      // Find the food item
      const food = await foodModel.findById(foodId);
      if (!food) {
        return res.status(404).json({ success: false, message: `Food item ${foodId} not found.` });
      }

      // Check if the user already rated this food item for this order
      const existingRating = food.ratings.find((r) => r.userId === userId && r.orderId === orderId);
      if (existingRating) {
        return res.status(400).json({ success: false, message: `You have already rated ${food.name} for this order.` });
      }

      // Add the new rating
      food.ratings.push({ userId, rating, orderId });

      // Recalculate average rating
      const totalRatings = food.ratings.length;
      const sumRatings = food.ratings.reduce((sum, r) => sum + r.rating, 0);
      food.averageRating = sumRatings / totalRatings;
      food.ratingCount = totalRatings;

      await food.save();
    }

    res.json({ success: true, message: "Ratings submitted successfully." });
  } catch (error) {
    console.error("Rate Food Error:", error);
    res.status(500).json({ success: false, message: "Error submitting ratings." });
  }
};

export { addFood,listFood,removeFood,updateFood,listFoodWithPagination,rateFood  };
