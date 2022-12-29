const express = require('express');
const StallOwner = require('../models/StallOwner');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchstallowner = require('../middleware/fetchstallowner');
const nodemailer = require('nodemailer')
const JWT_SECRET = 'CMN';

const sendmail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      auth: {
        user: 'milkmanapp0468@gmail.com', // generated ethereal user
        pass: 'saibehgduosuhavu', // generated ethereal password
      }
    });
    const custommail = {
      from: '"Cafe Management System  "milkmanapp0468@gmail.com',
      to: email,
      subject: "Forgot Password", // Subject line
      html: "Hello Mr/Mrs. " + name + "<br/><p> Please use the given OTP to verify your email.<br/></p>OTP : " + otp, // html body
    }
    transporter.sendMail(custommail, function (error, info) {
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

// ROUTE 1: Create a stallowner account using: POST "/api/stallowner/createstallowner". stallownerUI
router.post('/createstallowner', [
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
    // Check whether the stallowner with this phone_number exists already
    let stallowner = await StallOwner.findOne({ phone_number: req.body.phone_number });
    if (stallowner) {
      return res.status(400).json({ error: "Sorry a stallowner with this phone number already exists" })
    }
    // Check whether the stallowner with this email exists already
    stallowner = await StallOwner.findOne({ email: req.body.email });
    if (stallowner) {
      return res.status(400).json({ error: "Sorry a stallowner with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);


    stallowner = await StallOwner.create({
      name: req.body.name,
      password: secPass,
      phone_number: req.body.phone_number,
      email: req.body.email,
      role:req.body.role
    });
    const data = {
      stallowner: {
        id: stallowner.id,
        phone_number: stallowner.phone_number,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a stallowner using: POST "/api/stallowner/login". stallownerUI
router.post('/login', [
  body('email', 'email cannot be blank').exists(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let stallowner = await StallOwner.findOne({ email });
    if (!stallowner) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, stallowner.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      stallowner: {
        id: stallowner.id,
        name: stallowner.name,
        phone_number: stallowner.phone_number,
        email: stallowner.email,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken, data })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});


// ROUTE 3: Get  stallowner Details using: POST "/api/stallowner/getstallowner". stallownerUI
router.get('/getstallowner', fetchstallowner, async (req, res) => {

  try {
    const stallownerId = req.stallowner.id;
    const stallowner = await StallOwner.findById(stallownerId).select("-password")
    res.send(stallowner)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Update an existing stallowner using: PUT "/api/stallowner/updatestallowner". stallownerUI
router.put('/updatestallowner',
  fetchstallowner, async (req, res) => {
    const { name, email, phone_number } = req.body;
    try {
      const newstallowner = {};
      if (name) { newstallowner.name = name };
      if (email) {
        let stallowner = await StallOwner.findOne({ email: req.body.email });
        if (stallowner) {
          if (stallowner.id != req.stallowner.id) {
            return res.status(400).json({ error: "Sorry a stallowner with this email already exists" })
          }
        }
        newstallowner.email = email
      };
      if (phone_number) {
        let stallowner = await StallOwner.findOne({ phone_number: req.body.phone_number });
        if (stallowner) {
          if (stallowner.id != req.stallowner.id) {
            return res.status(400).json({ error: "Sorry a stallowner with this phone number already exists" })
          }
        }
        newstallowner.phone_number = phone_number
      };
      // Find the stallowner to be updated and update it
      let stallowner = await StallOwner.findById(req.stallowner.id);
      if (!stallowner) { return res.status(404).send("Not Found") }

      stallowner = await StallOwner.findByIdAndUpdate(req.stallowner.id, { $set: newstallowner }, { new: true })
      const data = {
        stallowner: {
          id: stallowner.id,
          name: stallowner.name,
          phone_number: stallowner.phone_number,
          email: stallowner.email,
          stall_location: stallowner.stall_location,
          role:stallowner.role,
        }
      }
      res.json({ data });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
// ROUTE 5: change Password a stallowner using: POST "/api/stallowner/changepassword". stallownerUI
//takes oldpassword,newpassword,stallownerid
router.post('/changepassword', [
  body('oldpassword', 'old password cannot be blank').exists(),
  body('newpassword', 'New password cannot be blank').exists(),
], fetchstallowner, async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldpassword, newpassword } = req.body;
  try {
    let stallowner = await StallOwner.findById(req.stallowner.id);
    if (!stallowner) {
      success = false
      return res.status(400).json({ error: "stallowner not Exists" });
    }

    const passwordCompare = await bcrypt.compare(oldpassword, stallowner.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please Enter Correct old Password" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newpassword, salt);
    stallowner.password = secPass

    let stallownerr = await StallOwner.findByIdAndUpdate(req.stallowner.id, { $set: stallowner }, { new: true })
    success = true;
    res.json({ success, stallownerr })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 6: email send  using: POST "/api/stallowner/sendemail". stallownerUI
//takes email in body
router.post('/sendemail', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let stallowner = await StallOwner.findOne({ email: req.body.email });
    if (!stallowner) {
      success = false
      return res.status(400).json({ error: "stallowner with this email not Exists" });
    }
    let generatedotp = Math.floor((Math.random() * 10000) + 1)
    const data = await StallOwner.updateOne({ email: req.body.email }, { $set: { otp: generatedotp } })

    sendmail(stallowner.name, stallowner.email, generatedotp)
    success = true
    res.json({ success, msg: "Email Sent Successfully" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});

//ROUTE 7: verify otp using: POST "/api/stallowner/updatepassword". stallownerUI
//takes email,otp,password in body
router.post('/updatepassword', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const stallowner = await StallOwner.findOne({ email: req.body.email })
    if (stallowner.otp == req.body.otp) {
      const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    stallowner.password = secPass

    let stallownerr = await StallOwner.findByIdAndUpdate(stallowner.id, { $set: stallowner }, { new: true })
    success = true;
    res.json({ success, msg: "Password Changed Successfully" })
    }
    res.json({ success, msg: "OTP Not Verified" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});



module.exports = router