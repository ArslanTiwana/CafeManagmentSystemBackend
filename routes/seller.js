const express = require('express');
const Seller = require('../models/Seller');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer')
var fetchseller = require('../middleware/fetchseller');

const JWT_SECRET = 'Milkman';

const sendmail=async (name,email,otp)=>{
  try {
    console.log(email)
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



// ROUTE 1: Create a Seller account using: POST "/api/sellerauth/createseller". sellerUI
router.post('/createseller', [
  
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
    // Check whether the seller with this phone_number exists already
    let seller = await Seller.findOne({ phone_number: req.body.phone_number });
    if (seller) {
      return res.status(400).json({ error: "Sorry a seller with this phone number already exists" })
    }
    // Check whether the seller with this email exists already
    seller = await Seller.findOne({ email: req.body.email });
    if (seller) {
      return res.status(400).json({ error: "Sorry a seller with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new Seller
    seller = await Seller.create({
      name: req.body.name,
      password: secPass,
      phone_number: req.body.phone_number,
      email: req.body.email,
      areas:req.body.areas,
      companyname:req.body.companyname,
      milk_rate:req.body.milk_rate,
    });
    const data = {
      seller: {
        id: seller.id,
        phone_number:seller.phone_number,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);


    // res.json(seller)
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a Seller using: POST "/api/sellerauth/login". SellerUI
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
    let seller = await Seller.findOne({ phone_number });
    if (!seller) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, seller.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
        seller: {
            id: seller.id,
            name:seller.name,
            phone_number:seller.phone_number,
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


// ROUTE 3: Get Seller Details using: POST "/api/sellerauth/getseller". SellerUI+Customer UI
router.post('/getseller', fetchseller, async (req, res) => {

  try {
    const sellerId = req.body.sellerid;
    const seller = await Seller.findById(sellerId).select("-password")
    res.send(seller)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 4: Update an existing seller using: PUT "/api/sellerauth/updateseller".SellerUI
router.put('/updateseller/:id', fetchseller,async (req, res) => {
  const { name,email,phone_number,milk_rate,areas,companyname  } = req.body;
  try {
      // Create a newseller object
      const newseller = {};
      if (name) { newseller.name = name };
      if (email) { newseller.email = email };
      if (phone_number) { newseller.phone_number= phone_number};
      if (milk_rate) { newseller.milk_rate = milk_rate};
      if (areas) { newseller.areas = areas};
      if (companyname) { newseller.companyname = companyname};
      // Find the seller to be updated and update it
      let seller = await Seller.findById(req.params.id);
      if (!seller) { return res.status(404).send("Not Found") }

      seller = await Seller.findByIdAndUpdate(req.params.id, { $set: newseller }, { new: true })
      res.json({ seller });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})

// ROUTE 5: Get Seller Details by Area using: POST "/api/sellerauth/getsellerbyarea". CustomerUI
router.post('/getsellerbyarea',  async (req, res) => {

  try {
    let areas = req.body.area
    const seller = await Seller.find({areas})
    res.send(seller)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 6: Get seller Details by phonenumber using: POST "/api/sellerauth/getsellerbyphonenumber". CustomerUI
router.post('/getsellerbyphonenumber',  async (req, res) => {

  try {
    const seller = await Seller.find({phone_number : req.body.phone_number})
    res.send(seller)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
// ROUTE 7: change Password a Seller using: POST "/api/sellerauth/changepassword". SellerUI
//takes oldpassword,newpassword,sellerid
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

  const { oldpassword, newpassword,sellerid } = req.body;
  try {
    let seller = await Seller.findById(sellerid);
    if (!seller) {
      success = false
      return res.status(400).json({ error: "Seller not Exists" });
    }

    const passwordCompare = await bcrypt.compare(oldpassword, seller.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please Enter Correct old Password" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newpassword, salt);
    seller.password=secPass
    
    let sellerr=await Seller.findByIdAndUpdate(sellerid,{ $set: seller }, { new: true })
    success = true;
    res.json({ success, sellerr })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 8: email send  using: POST "/api/sellerauth/sendemail". Seller UI
//takes email in body
router.post('/sendemail', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let seller = await Seller.findOne({email:req.body.email});
    if (!seller) {
      success = false
      return res.status(400).json({ error: "seller with this email not Exists" });
    }
let generatedotp=Math.floor((Math.random()*10000)+1)
const data=await Seller.updateOne({email:req.body.email},{$set:{otp:generatedotp}})
console.log("reached")
sendmail(seller.name,seller.email,generatedotp)
    success=true
    res.json({ success,msg:"Email Sent Successfully" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
//ROUTE 9: verify otp using: POST "/api/sellerauth/verifyotp". sellerUI
//takes email,otp in body
router.post('/verifyotp', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
  const seller=await Seller.findOne({email:req.body.email})
  if(seller.otp==req.body.otp){
    success=true
    return res.json({ success,msg:"OTP Verified Successfully" })

  }
    res.json({ success,msg:"OTP Not Verified" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
//ROUTE 9: Change Password using: POST "/api/sellerauth/forgotpassword". sellerUI
//takes email,password in body
router.post('/forgotpassword', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
  const seller=await Seller.findOne({email:req.body.email})
  
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt);
  seller.password=secPass
  
  let sellerr=await Seller.findByIdAndUpdate(seller.id,{ $set: seller }, { new: true })
  success = true;
  res.json({ success,msg:"Password Changed Successfully" })  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});

module.exports = router