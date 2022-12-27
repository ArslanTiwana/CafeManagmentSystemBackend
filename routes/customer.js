const express = require('express');
const Customer = require('../models/Customer');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchcustomer = require('../middleware/fetchcustomer');
const nodemailer=require('nodemailer')
const emailconfig=require('../config/emailconfig')
const JWT_SECRET = 'Milkman';

const sendmail=async (name,email,otp)=>{
try {
  console.log(emailconfig.email)
  const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS:true,
    auth: {
      user: 'milkmanapp0468@gmail.com', // generated ethereal user
      pass: 'pqpsgwxlntvpvons', // generated ethereal password
    }
  }); 
const custommail={
  from:'"MilkMan App"milkmanapp0468@gmail.com',
  to:email,
  subject: "Forgot Password", // Subject line
    html: "Hello Mr. "+name+"<br/><p> Please use the given OTP to verify your email.<br/></p>OTP : "+otp, // html body
}
transporter.sendMail(custommail, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  
} catch (error) {
  return res.status(400).json({ error: "Error occure while sending mail" })

  
}
}

// ROUTE 1: Create a Customer account using: POST "/api/customerauth/createcustomer". CustomerUI
router.post('/createcustomer', [
  body('name', 'Enter a valid name min Character 3').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Check whether the customer with this phone_number exists already
    let customer = await Customer.findOne({ phone_number: req.body.phone_number });
    if (customer) {
      return res.status(400).json({ error: "Sorry a Customer with this phone number already exists" })
    }
    // Check whether the customer with this email exists already
    customer = await Customer.findOne({ email: req.body.email });
    if (customer) {
      return res.status(400).json({ error: "Sorry a Customer with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

   
    customer = await Customer.create({
      name: req.body.name,
      password: secPass,
      phone_number: req.body.phone_number,
      email: req.body.email,
      area: req.body.area,
      address:req.body.address,
      
    });
    const data = {
      customer: {
        id: customer.id,
        phone_number:customer.phone_number,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);


    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a Customer using: POST "/api/customerauth/login". CustomerUI
router.post('/login', [
  body('phone_number', 'Ph_no cannot be blank').exists(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone_number, password } = req.body;
  try {
    let customer = await Customer.findOne({ phone_number });
    if (!customer) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, customer.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
        customer: {
            id: customer.id,
            name:customer.name,
            phone_number:customer.phone_number,
          }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken,data })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


// ROUTE 3: Get  Customer Details using: POST "/api/customerauth/getcustomer". CustomerUI
router.post('/getcustomer',fetchcustomer,  async (req, res) => {

  try {
    const customerId = req.body.customerid;
    const customer = await Customer.findById(customerId).select("-password")
    res.send(customer)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Get  Customer Details by phonenumber using: POST "/api/customerauth/getcustomerbyphonenumber".SellerUI
router.post('/getcustomerbyphonenumber',  async (req, res) => {

  try {
   
    const customer = await Customer.find({phone_number:req.body.phone_number})
    res.send(customer)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 5: Get Customer Details by Area using: POST "/api/customerauth/getcustomerbyarea" SellerUI
router.post('/getcustomerbyarea',  async (req, res) => {

  try {
    let area = req.body.area
    const customer = await Customer.find({area})
    res.send(customer)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 6: Update an existing customer using: PUT "/api/customerauth/updatecustomer". customerUI
router.put('/updatecustomer/:id', fetchcustomer,async (req, res) => {
  const { name,email,phone_number,area,address  } = req.body;
  try {
      const newcustomer = {};
      if (name) { newcustomer.name = name };
      if (email) { newcustomer.email = email };
      if (phone_number) { newcustomer.phone_number= phone_number};
      if (area) { newcustomer.area = area};
      if (address) { newcustomer.address = address};
      // Find the customer to be updated and update it
      let customer = await Customer.findById(req.params.id);
      if (!customer) { return res.status(404).send("Not Found") }

      customer = await Customer.findByIdAndUpdate(req.params.id, { $set: newcustomer }, { new: true })
      res.json({ customer });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})
// ROUTE 7: change Password a Customer using: POST "/api/customerauth/changepassword". CustomerUI
//takes oldpassword,newpassword,customerid
router.post('/changepassword', [
  body('oldpassword', 'old password cannot be blank').exists(),
  body('newpassword', 'New password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldpassword, newpassword,customerid } = req.body;
  try {
    let customer = await Customer.findById(customerid);
    if (!customer) {
      success = false
      return res.status(400).json({ error: "Customer not Exists" });
    }

    const passwordCompare = await bcrypt.compare(oldpassword, customer.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please Enter Correct old Password" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newpassword, salt);
    customer.password=secPass
    
    let customerr=await Customer.findByIdAndUpdate(customerid,{ $set: customer }, { new: true })
    success = true;
    res.json({ success, customerr })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 8: email send  using: POST "/api/customerauth/sendemail". CustomerUI
//takes email in body
router.post('/sendemail', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let customer = await Customer.findOne({email:req.body.email});
    if (!customer) {
      success = false
      return res.status(400).json({ error: "Customer with this email not Exists" });
    }
let generatedotp=Math.floor((Math.random()*10000)+1)
const data=await Customer.updateOne({email:req.body.email},{$set:{otp:generatedotp}})

sendmail(customer.name,customer.email,generatedotp)
    success=true
    res.json({ success,msg:"Email Sent Successfully" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});

//ROUTE 9: verify otp using: POST "/api/customerauth/verifyotp". CustomerUI
//takes email,otp in body
router.post('/verifyotp', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
  const customer=await Customer.findOne({email:req.body.email})
  if(customer.otp==req.body.otp){
    success=true
    return res.json({ success,msg:"OTP Verified Successfully" })

  }
    res.json({ success,msg:"OTP Not Verified" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
//ROUTE 9: Change Password using: POST "/api/customerauth/forgotpassword". CustomerUI
//takes email,password in body
router.post('/forgotpassword', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
  const customer=await Customer.findOne({email:req.body.email})
  
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt);
  customer.password=secPass
  
  let customerr=await Customer.findByIdAndUpdate(customer.id,{ $set: customer }, { new: true })
  success = true;
  res.json({ success,msg:"Password Changed Successfully" })  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


module.exports = router