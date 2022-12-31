const mongoose = require('mongoose');
const { Schema } = mongoose;

const MenuSchema = new Schema({
    productName:{
        type: String,
        required: true
    },
    price:{
        type:String
    },
    stall:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stall'
    },
    status:{  //active or not
        type:String
    },
    
    type:{   //desert,bevarage
        type:String,
        required: true
    },
    image:{
        type:String,
    }
   
   
  });
  const Menu = mongoose.model('menu', MenuSchema);
  module.exports = Menu;