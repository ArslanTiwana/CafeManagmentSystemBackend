const mongoose = require('mongoose');
const { Schema } = mongoose;

const RequestSchema = new Schema({
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    accepted:{
        type:Boolean,
        default:false
    }
   
  });
  const  Request = mongoose.model('request',  RequestSchema);
  module.exports =  Request;