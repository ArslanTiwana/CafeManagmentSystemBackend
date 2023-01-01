const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema = new Schema({
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
    otp:{
        type:Number
    },
    role:{
        type:String,
        required:true,
        default:"admin"
    }
  });
  const Admin = mongoose.model('admin', AdminSchema);
  module.exports = Admin;