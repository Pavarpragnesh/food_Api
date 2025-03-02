import categoryModel from "../models/categoryModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";

// Add Category
const addCategory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const image_filename = req.file.filename;

    const category = new categoryModel({
      name: req.body.name,
      image: image_filename,
    });

    await category.save();
    res.json({ success: true, message: "Category Added Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Remove old image if a new one is uploaded
    if (req.file) {
      fs.unlink(`uploads/${category.image}`, () => {});
      category.image = req.file.filename;
    }

    // Update category details
    category.name = req.body.name || category.name;

    await category.save();

    res.json({ success: true, message: "Category Updated Successfully.", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

// Get All Categories (Admin Only)
const listCategories = async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from request

    // Check if user is an admin
    const user = await userModel.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not an admin" });
    }

    // Fetch categories
    const categories = await categoryModel.find({});
    res.json({ success: true, data: categories });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};


// Delete Category
const removeCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.body.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    fs.unlink(`uploads/${category.image}`, () => {});

    await categoryModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Category Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

export { addCategory, listCategories, updateCategory, removeCategory };
