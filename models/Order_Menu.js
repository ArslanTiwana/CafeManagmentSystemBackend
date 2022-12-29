const mongoose = require('mongoose');
const { Schema } = mongoose;

const Order_MenuSchema = new Schema({
    menu:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menu'
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    }, 
    qty:{
        type:Number
    }, 
  });
  const Order_Menu = mongoose.model('order_menu', Order_MenuSchema);
  module.exports = Order_Menu;