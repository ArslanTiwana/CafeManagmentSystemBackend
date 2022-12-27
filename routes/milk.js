const express = require('express');
const router = express.Router();
const fetchseller = require('../middleware/fetchseller');
const fetchcustomer = require('../middleware/fetchcustomer');
const Seller=require('../models/Seller')
const Milk = require('../models/Milk');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Milk using: POST "/api/milk/getallmilkbyseller". for SellerUI 
// endpoint give all of his own milk between dates,takes startdate,enddate,sellerid
router.post('/getallmilkbyseller',fetchseller, async (req, res) => {
    try {
        let startdate=req.body.startdate
        let enddate=req.body.enddate
        const milk = await Milk.find({ seller:req.body.sellerid,date:{$gte:startdate,$lte:enddate} });
        let totalAmount=0;
       milk.forEach(element => {
        totalAmount= totalAmount+(element.quantity*element.rate)
       });
       
        res.json({milk,totalAmount})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 2: Get All the Milk using: POST "/api/milk/getallmilkbycustomer".   For CustomerUI 
//endpoint give all of his own milks between dates,takes startdate,enddate,customerid
router.post('/getallmilkbycustomer',fetchcustomer, async (req, res) => {
    try {
        
        let startdate=req.body.startdate
        let enddate=req.body.enddate
        const milk = await Milk.find({ customer:req.body.customerid,date:{$gte:startdate,$lte:enddate} });
        let totalAmount=0;
       milk.forEach(element => {
        totalAmount= totalAmount+(element.quantity*element.rate)
       });
       
        res.json({milk,totalAmount})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 3: Add new milk using: POST "/api/milk/addmilk". for SellerUI
router.post('/addmilk', fetchseller,async (req, res) => {
        try {
            const { quantity,rate,customerid,date } = req.body;
           
            // If there are errors, return Bad request and the errors
            const seller=await Seller.findById(req.seller.id).select("-password")
            console.log(seller.milk_rate)
            let ratee=seller.milk_rate;
            if(rate){
                ratee=rate
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let datee=Date.now()
            if(date){
                datee=date
            }
           
            const milk = new Milk({
                quantity:quantity,date:datee,rate:ratee,seller:req.seller.id,customer:customerid
            })
            const savedmilk = await milk.save()
          
            res.json({savedmilk,success:true})

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

// ROUTE 4: Update an existing milk using: PUT "/api/milk/updatemilk".For SellerUI
router.put('/updatemilk/:id', fetchseller, async (req, res) => {
    const { quantity,date,rate,customerid  } = req.body;
    try {
        // Create a newmilk object
        const newmilk = {};
        if (quantity) { newmilk.quantity = quantity };
        if (date) { newmilk.date = date };
        if (rate) { newmilk.rate= rate};
        if (customerid) { newmilk.customer = customerid};
        // Find the milk to be updated and update it
        let milk = await Milk.findById(req.params.id);
        if (!milk) { return res.status(404).send("Not Found") }

        milk = await Milk.findByIdAndUpdate(req.params.id, { $set: newmilk }, { new: true })
        res.json({ milk });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 5: Delete an existing milk using: DELETE "/api/milk/deletemilk". For SellerUI
router.delete('/deletemilk/:id', fetchseller,async (req, res) => {
    try {
        let milk = await Milk.findById(req.params.id);
        if (!milk) { return res.status(404).send("Not Found") }

        
        milk = await Milk.findByIdAndDelete(req.params.id)
        console.log(milk)
        res.json({ "Success": "Milk has been deleted", milk: milk });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 6: Get All the Milk by dates of specific customer using: GET "/api/milk/getreport". For SellerUI+Customerui
//customer can get all of his milk between dates purchased from that seller,seller can get all milk between dates of sold to specific customer
//takes customerid,sellerid,start date,enddate
router.post('/getreport', async (req, res) => {
    try {
        let startdate=req.body.startdate
        let enddate=req.body.enddate
        const milk = await Milk.find({ customer: req.body.customerid,seller:req.body.sellerid,date:{$gte:startdate,$lte:enddate} });
        let totalAmount=0;
       milk.forEach(element => {
        totalAmount= totalAmount+(element.quantity*element.rate)
       });
       
        res.json({milk,totalAmount})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 8: Change All the Guest by Registered Customer using: GET "/api/milk/changeguesttocustomer". For SellerUI
router.post('/changeguesttocustomer', async (req, res) => {
    try {
        const{guestid,customerid}=req.body
        let updatedmilk=[]
        const milk = await Milk.find({ customer: guestid});
       for(let a=0;a<milk.length;a++){
        milk[a].customer=customerid
        updatedmilk=await Milk.findByIdAndUpdate(milk[a].id,{ $set: milk[a] }, { new: true })
       }
        res.json({success:true,updatedmilk})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router