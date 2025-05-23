import mongoose from "mongoose"; 

const orderSchema = new mongoose.Schema({
  userId:{type:String,required:true},
  items:{type:Array,required:true},
  amount:{type:Number,required:true},
  address:{type:Object,required:true},
  status:{type:String,default:"Food Proccessing"},
  date:{type:Date,default:Date.now()},
  // date: { type: Date, default: () => Date.now() },
  payment:{type:Boolean,default:false},
  acceptedBy: { 
    type: {
      userId: String,
      name: String,
      mobile: String,
    }, 
    default: null 
  },
  deliveryCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
})

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);

export default orderModel;