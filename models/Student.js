const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema({
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
    regNo:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    otp:{
        type:Number,
    },
    role:{
        type:String,
        required:true
    }
  });
  const Student = mongoose.model('student', StudentSchema);
  module.exports = Student;