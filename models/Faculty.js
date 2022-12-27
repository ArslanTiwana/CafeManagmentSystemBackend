const mongoose = require('mongoose');
const { Schema } = mongoose;

const FacultySchema = new Schema({
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
    office_location:{
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
  const Faculty = mongoose.model('faculty', FacultySchema);
  module.exports = Faculty;