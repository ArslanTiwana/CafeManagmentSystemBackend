const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    total_price:{
        type:Number
    },
    status:{
        type:String
        // complete, pending, inprogress,On its Way 
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    faculty:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'faculty'
    },
    type:{
        type:String
        // pickup or delivery to office
    },
    stall:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stall'
    },  
  });
  const Order = mongoose.model('order', OrderSchema);
  module.exports = Order;