import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name:{type:String,required:true},
  description:{type:String,required:true},
  price:{type:Number,required:true},
  image:{type:String,required:true},
  category:{type:String,required:true},
  ratings: [{
    userId: { type: String, required: true }, // Who rated it
    rating: { type: Number, min: 1, max: 5, required: true }, // Rating value
    orderId: { type: String, required: true }, // Link to the order
  }],
  averageRating: { type: Number, default: 0 }, // Computed average rating
  ratingCount: { type: Number, default: 0 },
})

const foodModel = mongoose.model.food || mongoose.model("food",foodSchema);

export default foodModel;