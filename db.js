const mongoose = require('mongoose');
require('dotenv/config');
// const mongoURI = "mongodb+srv://cafemanagementsystem:cafemanagementsystem@cluster0.kdjsbvj.mongodb.net/?retryWrites=true&w=majority"
//mongodb://localhost:27017/?readPreference=primary&directConnection=true
// mongodb+srv://cafemanagementsystem:cafemanagementsystem@cluster0.kdjsbvj.mongodb.net/?retryWrites=true&w=majority

const connectToMongo = ()=>{
    mongoose.connect(process.env.DATABASE, ()=>{
        console.log("Connected to Mongo Successfully");
    })
}

module.exports = connectToMongo;