const mongoose = require('mongoose');
const { Schema } = mongoose;

const CafeSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    location:{
        type:String
    }, 
  });
  const Cafe = mongoose.model('cafe', CafeSchema);
  module.exports = Cafe;