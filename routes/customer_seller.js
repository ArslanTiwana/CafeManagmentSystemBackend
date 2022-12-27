const express = require('express');
const router = express.Router();
const fetchseller = require('../middleware/fetchseller');
const fetchcustomer = require('../middleware/fetchcustomer');
const Seller=require('../models/Seller')
const Customer = require('../models/Customer');
const Customer_Seller=require('../models/Customer_Seller')
const { body, validationResult } = require('express-validator');


// ROUTE 1: Add new Customer_seller using: POST "/api/customer_seller/addcustomer_seller". for SellerUI
//this end point allow the seller to link a specific customer with him ,take customer id in body 
router.post('/addcustomer_seller', async (req, res) => {
    try {
        const { customerid,sellerid } = req.body;
       
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
       
        const customer_seller = new Customer_Seller({
            seller: sellerid,
            customer: customerid,
            amountpaid:0,
        })
        const savedcustomer_seller = await customer_seller.save()
      
        res.json({savedcustomer_seller,success:true})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Delete an existing customer_seller using: DELETE "/api/customer_seller/deletecustomer_seller". seller UI+CustomerUI
//this end point allow the seller,customer to Unlink a specific customer or seller with him ,takes customer id in parameter

router.delete('/deletecustomer_seller/:id', async (req, res) => {
    try {
        // Find the customer who is linked with that seller to be delete and delete it
        let customer_seller = await Customer_Seller.find({customer:req.params.id,seller:req.seller.id});
        if (!customer_seller) { return res.status(404).send("Not Found") }

     
        customer_seller = await Customer_Seller.findOneAndDelete({customer:req.params.id,seller:req.seller.id})
        res.json({ "Success": "sellercustomer has been deleted", customer_seller: customer_seller });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 3: Get  all Customer by seller using: GET "/api/customer_seller/getallcustomerbyseller". SellerUI
//this end point will give all the customer of seller itself  ,takes seller id in parameter
router.get('/getallcustomerbyseller/:id', async (req, res) => {
    try {
        const customer_seller = await Customer_Seller.find({ seller: req.params.id });
        // console.log(customer_seller);
        let customerids=[]
        let customers=[]
        for(let a=0;a<customer_seller.length;a++){
            customerids[a]=customer_seller[a].customer
        }
        
        customers = await Customer.find({_id:{ $in : customerids }})

        res.json({customerids,customers})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Get All the sellers of specific Customer using: GET "/api/customer_seller/getallsellerbycustomer". CustomerUI
//this end point will give all the seller of customer itself  ,takes customer id in parameter

router.get('/getallsellerbycustomer/:id', async (req, res) => {
    try {
        const customer_seller = await Customer_Seller.find({ customer: req.params.id });
        let sellerids=[]
        let sellers=[]
        for(let a=0;a<customer_seller.length;a++){
            sellerids[a]=customer_seller[a].seller
        }
        
        sellers = await Seller.find({_id:{ $in : sellerids }})

        res.json({sellerids,sellers})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 5: Add payment using: POST "/api/customer_seller/addpayment". sellerUI
//this end point will add payments  ,takes customer id,seller id,amount 

router.post('/addpayment', fetchseller,async (req, res) => {
    try {
        console.log(req.body.amount)
        const customer_seller = await Customer_Seller.find({ customer: req.body.customerid,seller:req.body.sellerid });
        if(customer_seller[0]){
            let amountobj={
                Amount:req.body.amount,
                Date:new Date,
            }
            
        customer_seller[0].amountpaid.push( amountobj)
       const customerseller = await Customer_Seller.findByIdAndUpdate(customer_seller[0].id,{ $set: customer_seller[0] }, { new: true })
        res.json(customerseller)
        }
        else{
            res.json({msg:"Not Found"})
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 6: Get AllPayments of Specific Customer using: POST "/api/customer_seller/getallpaymentsbycustomer". CustomerUI
//End point give the All Payments of Customer along with seller whom payment is paid and total Amount paid,takes customerid in body
router.post('/getallpaymentsbycustomer', async (req, res) => {
    try {
        const customer_seller = await Customer_Seller.find({ customer: req.body.customerid });
        let sellers=[];
        let sellerids=[]
        let amounts=[]
        let paymentplusseller=[{}]
        let totalamountpaid=0;
       for(let a = 0 ; a < customer_seller.length ; a++ ){
        sellerids[a]=customer_seller[a].seller
        totalamountpaid=totalamountpaid+customer_seller[a].amountpaid
        amounts[a]=customer_seller[a].amountpaid
       
        
       }
       sellers = await Seller.find({_id:{ $in : sellerids }})
       for(let a=0;a<customer_seller.length;a++){
        paymentplusseller[a]={
            seller:sellers[a],
            payment:amounts[a]

        }       }
       

        res.json({paymentplusseller,totalamountpaid})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 7: Get AllPayment of Specific Seller using: GET "/api/customer_seller/getallpaymentsbyseller". SellerUI
//End point give the All Payments of Seller along with customer whome payment is taken and total Ammount taken,takes sellerid in body
router.post('/getallpaymentsbyseller', async (req, res) => {
    try {
        const customer_seller = await Customer_Seller.find({ seller: req.body.sellerid });
        let customers=[];
        let customerids=[]
        let amounts=[]
        let paymentpluscustomer=[{}]
        let totalamountpaid=0;
       for(let a = 0 ; a < customer_seller.length ; a++ ){
        customerids[a]=customer_seller[a].customer
        amounts[a]=customer_seller[a].amountpaid
        totalamountpaid=totalamountpaid+customer_seller[a].amountpaid

        
       }
       customers = await Customer.find({_id:{ $in : customerids }})
       console.log(customers)
       for(let a=0;a<customer_seller.length;a++){
        paymentpluscustomer[a]={
            customer:customers[a],
            payment:amounts[a]

        }       }
       

        res.json({paymentpluscustomer,totalamountpaid})
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 8: Get Payment of Seller_Customer using: GET "/api/customer_seller/getpayment". SellerUI+CustomerUI
//End point give the  Payment of Seller conected to customer ,takes sellerid,customerid in body
router.post('/getpayment', async (req, res) => {
    try {
        const customer_seller = await Customer_Seller.find({ seller: req.body.sellerid,customer:req.body.customerid });
       
        res.json(customer_seller[0].amountpaid)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router