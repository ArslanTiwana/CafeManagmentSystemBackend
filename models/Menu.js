const mongoose = require('mongoose');
const { Schema } = mongoose;

const MenuSchema = new Schema({
    productName:{
        type: String,
        required: true
    },
    qty:{
        type:Number
    },
    price:{
        type:String
    },
    stall:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stall'
    },
    status:{
        type:String
    },
    preparation_time:{
        type:Number
    }
   
   
  });
  const Stall = mongoose.model('stall', StallSchema);
  module.exports = Stall;