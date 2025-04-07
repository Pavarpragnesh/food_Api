import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  discountType: { 
    type: String, 
    enum: ['percentage', 'flat'], 
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

const offerModel = mongoose.model("Offer", offerSchema);
export default offerModel;