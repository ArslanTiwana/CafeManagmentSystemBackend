const mongoose = require('mongoose');
const { Schema } = mongoose;

const MilkSchema = new Schema({
    quantity:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required: true,
        default:Date.now()
    },
    rate:{
        type: Number,
        required:true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'seller'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
   
   
   
  });
  const Milk = mongoose.model('milk', MilkSchema);
  module.exports = Milk;