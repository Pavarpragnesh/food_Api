import termsModel from "../models/termsModel.js";
import userModel from "../models/userModel.js";

// Add new terms
const addTerms = async (req, res) => {
  try {
    const { title, subtitle, descriptions, userId } = req.body;

    // Validate input
    if (!title || !subtitle || !Array.isArray(descriptions) || descriptions.length === 0) {
      return res.status(400).json({ success: false, message: "Title, subtitle, and descriptions array are required" });
    }

    // Check if user is admin
    const userData = await userModel.findById(userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not an admin" });
    }

    const terms = new termsModel({
      title,
      subtitle,
      descriptions
    });

    await terms.save();
    res.json({ success: true, message: "Terms added successfully", data: terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding terms", error });
  }
};

// Get all terms
const getTerms = async (req, res) => {
  try {
    const terms = await termsModel.find({});
    res.json({ success: true, data: terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching terms", error });
  }
};

// Update terms
const updateTerms = async (req, res) => {
  try {
    const { id, title, subtitle, descriptions, userId } = req.body;

    // Check if user is admin
    const userData = await userModel.findById(userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not an admin" });
    }

    // Find the terms document
    const terms = await termsModel.findById(id);
    if (!terms) {
      return res.status(404).json({ success: false, message: "Terms not found" });
    }

    // Update fields if provided
    if (title) terms.title = title;
    if (subtitle) terms.subtitle = subtitle;
    if (descriptions && Array.isArray(descriptions)) terms.descriptions = descriptions;

    terms.updatedAt = Date.now();
    await terms.save();

    res.json({ success: true, message: "Terms updated successfully", data: terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating terms", error });
  }
};

// Delete terms
const deleteTerms = async (req, res) => {
  try {
    const { id, userId } = req.body;

    // Check if user is admin
    const userData = await userModel.findById(userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not an admin" });
    }

    const terms = await termsModel.findByIdAndDelete(id);
    if (!terms) {
      return res.status(404).json({ success: false, message: "Terms not found" });
    }

    res.json({ success: true, message: "Terms deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting terms", error });
  }
};

export { addTerms, getTerms, updateTerms, deleteTerms };