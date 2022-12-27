const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomerSchema = new Schema({
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
    area:{
        type: String,
        // required: true
    },
    address:{
        type: String,
    },
    otp:{
        type:Number,
    }

    
   
  });
  const Customer = mongoose.model('customer', CustomerSchema);
  module.exports = Customer;