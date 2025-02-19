import mongoose from "mongoose";

export const connectDB = async () =>{
  await mongoose.connect('mongodb+srv://pavarpragnesh23:Pavar07@cluster0.nxaax.mongodb.net/food').then(()=>console.log("DB Connected"));
}