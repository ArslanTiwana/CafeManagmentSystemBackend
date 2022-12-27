const mongoose = require('mongoose');
const { Schema } = mongoose;

const SellerSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    phone_number:{
        type: Number,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    areas:{
        type: [String],
        required: true
    },
    company_name:{
        type:String
    },
    milk_rate:{
        type:Number,
        required:true
    },
    otp:{
        type:Number
    }
   
   
  });
  const Seller = mongoose.model('seller', SellerSchema);
  module.exports = Seller;