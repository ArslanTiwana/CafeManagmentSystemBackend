const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchadmin = require('../middleware/fetchadmin');
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

// ROUTE 1: Create a admin account using: POST "/api/admin/createadmin". 
router.post('/createadmin', [
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
    // Check whether the admin with this phone_number exists already
    let admin = await Admin.findOne({ phone_number: req.body.phone_number });
    if (admin) {
      return res.status(400).json({ error: "Sorry a admin with this phone number already exists" })
    }
    // Check whether the admin with this RegNo exists already
    admin = await Admin.findOne({ regNo: req.body.regNo });
    if (admin) {
      return res.status(400).json({ error: "Sorry a admin with this Reg No already exists" })
    }
    // Check whether the admin with this email exists already
    admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
      return res.status(400).json({ error: "Sorry a admin with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);


    admin = await Admin.create({
      name: req.body.name,
      password: secPass,
      phone_number: req.body.phone_number,
      email: req.body.email,
      office_location: req.body.office_location,
      role:req.body.role
    });
    const data = {
      admin: {
        id: admin.id,
        phone_number: admin.phone_number,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a admin using: POST "/api/admin/login". adminUI
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
    let admin = await Admin.findOne({ email });
    if (!admin) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, admin.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      admin: {
        id: admin.id,
        name: admin.name,
        phone_number: admin.phone_number,
        email: admin.email,
        office_location: admin.office_location
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


// ROUTE 3: Get  admin Details using: POST "/api/admin/getadmin". adminUI
router.get('/getadmin', fetchadmin, async (req, res) => {

  try {
    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId).select("-password")
    res.send(admin)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Update an existing admin using: PUT "/api/admin/updateadmin". adminUI
router.put('/updateadmin',
  fetchadmin, async (req, res) => {
    const { name, email, phone_number,office_location } = req.body;
    try {
      const newadmin = {};
      if (name) { newadmin.name = name };
      if (office_location) { newadmin.office_location = office_location };
      if (email) {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
          if (admin.id != req.admin.id) {
            return res.status(400).json({ error: "Sorry a admin with this email already exists" })
          }
        }
        newadmin.email = email
      };
      if (phone_number) {
        let admin = await Admin.findOne({ phone_number: req.body.phone_number });
        if (admin) {
          if (admin.id != req.admin.id) {
            return res.status(400).json({ error: "Sorry a admin with this phone number already exists" })
          }
        }
        newadmin.phone_number = phone_number
      };
      // Find the admin to be updated and update it
      let admin = await Admin.findById(req.admin.id);
      if (!admin) { return res.status(404).send("Not Found") }

      admin = await Admin.findByIdAndUpdate(req.admin.id, { $set: newadmin }, { new: true })
      const data = {
        admin: {
          id: admin.id,
          name: admin.name,
          phone_number: admin.phone_number,
          email: admin.email,
          office_location: admin.office_location,
          role:admin.role,
        }
      }
      res.json({ data });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
// ROUTE 5: change Password a admin using: POST "/api/admin/changepassword". adminUI
//takes oldpassword,newpassword,adminid
router.post('/changepassword', [
  body('oldpassword', 'old password cannot be blank').exists(),
  body('newpassword', 'New password cannot be blank').exists(),
], fetchadmin, async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldpassword, newpassword } = req.body;
  try {
    let admin = await Admin.findById(req.admin.id);
    if (!admin) {
      success = false
      return res.status(400).json({ error: "admin not Exists" });
    }

    const passwordCompare = await bcrypt.compare(oldpassword, admin.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please Enter Correct old Password" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newpassword, salt);
    admin.password = secPass

    let adminr = await Admin.findByIdAndUpdate(req.admin.id, { $set: admin }, { new: true })
    success = true;
    res.json({ success, adminr })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 6: email send  using: POST "/api/admin/sendemail". adminUI
//takes email in body
router.post('/sendemail', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      success = false
      return res.status(400).json({ error: "admin with this email not Exists" });
    }
    let generatedotp = Math.floor((Math.random() * 10000) + 1)
    const data = await Admin.updateOne({ email: req.body.email }, { $set: { otp: generatedotp } })

    sendmail(admin.name, admin.email, generatedotp)
    success = true
    res.json({ success, msg: "Email Sent Successfully" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});

//ROUTE 7: verify otp using: POST "/api/admin/updatepassword". adminUI
//takes email,otp,password in body
router.post('/updatepassword', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const admin = await Admin.findOne({ email: req.body.email })
    if (admin.otp == req.body.otp) {
      const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    admin.password = secPass

    let adminr = await Admin.findByIdAndUpdate(admin.id, { $set: admin }, { new: true })
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