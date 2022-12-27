const mongoose = require('mongoose');
require('dotenv/config');
const mongoURI = "mongodb://localhost:27017/?readPreference=primary&directConnection=true"

//"mongodb+srv://arslantiwana:Tiwana0111@cluster0.dlzbood.mongodb.net/?retryWrites=true&w=majority"

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to Mongo Successfully");
    })
}

module.exports = connectToMongo;