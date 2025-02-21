import foodModel from "../models/foodModel.js";
import fs from "fs";

// Add food item
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const image_filename = req.file.filename;

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename,
    });

    await food.save();
    res.json({ success: true, message: "Food Added Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

// Update food item
const updateFood = async (req, res) => {
  try {
    const { id } = req.body;
    const food = await foodModel.findById(id);

    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // Remove old image if a new one is uploaded
    if (req.file) {
      fs.unlink(`uploads/${food.image}`, () => {});
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
    res.status(500).json({ success: false, message: "Error", error });
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
const removeFood = async (req,res) => {
try{
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`,()=>{})

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({success:true,message:"Food Removed"});
  }catch(error) {
    console.log(erro);
    res.json({success:false,message:"Error"});
}
}


export { addFood,listFood,removeFood,updateFood,listFoodWithPagination  };
