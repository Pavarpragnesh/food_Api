import mongoose from "mongoose";

const termsSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Single title
  subtitle: { type: String, required: true }, // Single subtitle
  descriptions: [{ type: String, required: true }], // Array of descriptions
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const termsModel = mongoose.model("Terms", termsSchema);
export default termsModel;