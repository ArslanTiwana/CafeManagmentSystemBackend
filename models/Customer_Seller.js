const mongoose = require('mongoose');
const { Schema } = mongoose;

const Customer_SellerSchema = new Schema({
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    amountpaid:{
        type:[{}],
        default:0,
        required:true,
    },
    // date:{
    //     type:Date,
    // }
   
  });
  const  Customer_Seller = mongoose.model('customer_seller',  Customer_SellerSchema);
  module.exports =  Customer_Seller;