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


export { addFood,listFood,removeFood };
