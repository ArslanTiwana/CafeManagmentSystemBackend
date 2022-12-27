const mongoose = require('mongoose');
const { Schema } = mongoose;

const StallOwnerSchema = new Schema({
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
    stall_location:{
        type:String
    },
    otp:{
        type:Number
    },
    role:{
        type:String,
        required:true
    }

  });
  const StallOwner = mongoose.model('stallowner', StallOwnerSchema);
  module.exports = StallOwner;