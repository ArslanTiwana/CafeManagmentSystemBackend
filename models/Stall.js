const mongoose = require('mongoose');
const { Schema } = mongoose;

const StallSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    location:{
        type:String
    },
    cafe:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cafe'
    },
   
  });
  const Stall = mongoose.model('stall', StallSchema);
  module.exports = Stall;