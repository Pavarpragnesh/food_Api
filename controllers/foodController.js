import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";

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


export { addFood,listFood,removeFood,updateFood,listFoodWithPagination  };
