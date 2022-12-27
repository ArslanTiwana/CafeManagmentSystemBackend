const express = require('express');
const GuestCustomer = require('../models/Guestcustomer');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchseller = require('../middleware/fetchseller');



// ROUTE 1: Create a Guest Customer account using: POST "/api/guestcustomer/addguestcustomer". SellerUI
//end point take name,ph_no,address,sellerid
router.post('/addguestcustomer',fetchseller,  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const guestcustomer = await GuestCustomer.create({
        name: req.body.name,
        phone_number: req.body.phone_number,
        address:req.body.address,
        seller:req.body.sellerid
        
      });
      res.json( guestcustomer )
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
// ROUTE 2: Get GuestCustomer Details using: POST "/api/guestcustomer/getguestcustomer". SellerUI
//takes guestcustomerid
router.post('/getguestcustomer',fetchseller,  async (req, res) => {

    try {
      const guestcustomerid = req.body.guestcustomerid;
      const guestcustomer = await GuestCustomer.findById(guestcustomerid)
      res.send(guestcustomer)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
  // ROUTE 3: Update an existing guestcustomer using: PUT "/api/guestcustomer/updateguestcustomer".SellerUi
  //takes name,ph_no,address,guestcustomerid in parameter
router.put('/updateguestcustomer/:id',fetchseller, async (req, res) => {
    const { name,phone_number,address } = req.body;
    try {
        const newguestcustomer = {};
        if (name) { newguestcustomer.name = name };
        if (phone_number) { newguestcustomer.phone_number= phone_number};
        if (address) { newguestcustomer.address = address};
        let guestcustomer = await GuestCustomer.findById(req.params.id);
        if (!guestcustomer) { return res.status(404).send("Not Found") }
  
        guestcustomer = await GuestCustomer.findByIdAndUpdate(req.params.id, { $set: newguestcustomer }, { new: true })
        res.json({ guestcustomer });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
  })
  // ROUTE 4: Delete an existing Guest Customer using: DELETE "/api/guestcustomer/deleteguestcustomer". For SellerUI
  //takes GuestCustomer id in parametrs
router.delete('/deleteguestcustomer/:id',fetchseller, async (req, res) => {
    try {
        let guestcustomer = await GuestCustomer.findById(req.params.id);
        if (!guestcustomer) { return res.status(404).send("Not Found") }

        
        guestcustomer = await GuestCustomer.findByIdAndDelete(req.params.id)
        res.json({ "Success": "guestcustomer has been deleted", guestcustomer: guestcustomer });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 5: Get GuestCustomer by seller Details using: POST "/api/guestcustomer/getguestcustomerbyseller". SellerUI
//takes sellerid
router.post('/getguestcustomerbyseller',fetchseller,  async (req, res) => {

    try {
      const sellerid = req.body.sellerid;
      const guestcustomer = await GuestCustomer.find({seller:sellerid})
      res.send(guestcustomer)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
  // ROUTE 6: Get GuestCustomerbyphonenumber Details using: POST "/api/guestcustomer/getguestcustomerbyphonenumber". SellerUI
//takes phonenumber
router.post('/getguestcustomerbyphonenumber',  async (req, res) => {

  try {
    const phone_number = req.body.phone_number;
    const guestcustomer = await GuestCustomer.find({phone_number:phone_number,seller:req.seller.id})
    res.send(guestcustomer)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
  module.exports = router