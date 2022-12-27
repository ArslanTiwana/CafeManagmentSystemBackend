const express = require('express');
const router = express.Router();
const fetchseller = require('../middleware/fetchseller');
const fetchcustomer = require('../middleware/fetchcustomer');
const Seller=require('../models/Seller')
const Customer = require('../models/Customer');
const Request=require('../models/Request')
const { body, validationResult } = require('express-validator');


// ROUTE 1: Add new request using: POST "/api/request/addrequest". customerUI
router.post('/addrequest', async (req, res) => {
    try {
        const { sellerid,customerid } = req.body;
       
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
       
        const request = new Request({
            seller: sellerid,
            customer: customerid,
        })
        const savedrequest = await request.save()
      
        res.json({savedrequest,success:true})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Delete an existing request using: DELETE "/api/request/deleterequest". Customer+SellerUI
router.delete('/deleterequest/:id', async (req, res) => {
    try {
        // Find the request to be delete and delete it
        let request = await Request.findById(req.params.id);
        if (!request) { return res.status(404).send("Not Found") }

     
        request = await Request.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Request has been deleted", request: request});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 3: Get All the Requestofspecificseller using: GET "/api/request/getallrequestbyseller".For SellerUI 
// this endpoint give you all the customers who send request to that seller,takes sellerid in parameters
router.get('/getallrequestbyseller/:id', async (req, res) => {
    try {
        const request = await Request.find({ seller: req.params.id });
        // console.log(customer_seller);
        let customerids=[]
        let customers=[]
        for(let a=0;a<request.length;a++){
            customerids[a]=request[a].customer
        }
        
        customers = await Customer.find({_id:{ $in : customerids }})
        
        res.json({request,customers})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Get All the Request of specific Customer using: GET "/api/request/getallrequestbycustomer". For CustomerUI
// this endpoint give you all the sellers whome that customer sended requests 

router.get('/getallrequestbycustomer/:id', async (req, res) => {
    try {
        const request = await Request.find({ customer: req.params.id });
        let sellerids=[]
        let sellers=[]
        for(let a=0;a<request.length;a++){
            sellerids[a]=request[a].seller
        }
        
        sellers = await Seller.find({_id:{ $in : sellerids }})
        res.json({request,sellers})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router