const mongoose = require('mongoose');
const { Schema } = mongoose;

const GuestcustomerSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    phone_number:{
        type: Number,
        required: true,
        
    },
    address:{
        type: String,
        required: true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'seller',
    }
    
   
  });
  const Guestcustomer = mongoose.model('guestcustomer', GuestcustomerSchema);
  module.exports = Guestcustomer;