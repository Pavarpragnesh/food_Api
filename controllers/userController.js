import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import fs from "fs";

// Ensure "uploads/" directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// Create Token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id, user.role);
    res.json({ success: true, token, role: user.role, photo: user.photo,name: user.name,mobile: user.mobile,user: user._id});
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// Register User with Photo Upload
const registerUser = async (req, res) => {
  try {
    const { name, address, email, mobile, password, role } = req.body;
    const photo = req.file ? req.file.filename : ""; // Store only filename

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Weak password (min 6 characters)" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      name,
      address,
      email,
      mobile,
      photo,
      password: hashedPassword,
      role: role || "user",
    });

    const user = await newUser.save();
    const token = createToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      role: user.role,
      photo: user.photo,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// List Users
const listUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, "-password"); // Exclude passwords
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("List Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete photo from uploads folder (optional)
    if (user.photo) {
      const photoPath = `uploads/${user.photo}`;
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await userModel.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// EDIT / UPDATE USER
const editUser = async (req, res) => {
  const userId = req.params.id;
  const { name, address, email, mobile, role } = req.body;
  const newPhoto = req.file ? req.file.filename : null;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If new photo uploaded, remove old photo
    if (newPhoto && user.photo) {
      const oldPhotoPath = `uploads/${user.photo}`;
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.address = address || user.address;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.role = role || user.role;
    user.photo = newPhoto || user.photo;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Edit User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export { loginUser, registerUser,listUsers,deleteUser,editUser };
