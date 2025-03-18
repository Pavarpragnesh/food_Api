// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name:{type:String,required:true},
//   email:{type:String,required:true,unique:true},
//   password:{type:String,required:true},
//   role: { type: String, default:"user" },
//   cartData:{type:Object,default:{}},
// },{minimize:false})

// const userModel = mongoose.model.user || mongoose.model("user",userSchema);
// export default userModel;



import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String},
  email: { type: String, required: true, unique: true },
  mobile: { type: String},
  photo: { type: String, default: "" }, // Store only the filename
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "delivery boy"], default: "user" },
  cartData: { type: Object, default: {} },
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
