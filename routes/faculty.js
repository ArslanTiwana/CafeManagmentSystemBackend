const express = require('express');
const Faculty = require('../models/Faculty');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchfaculty = require('../middleware/fetchfaculty');
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

// ROUTE 1: Create a faculty account using: POST "/api/faculty/createfaculty". facultyUI
router.post('/createfaculty', [
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
    // Check whether the faculty with this phone_number exists already
    let faculty = await Faculty.findOne({ phone_number: req.body.phone_number });
    if (faculty) {
      return res.status(400).json({ error: "Sorry a faculty with this phone number already exists" })
    }
    // Check whether the faculty with this RegNo exists already
    faculty = await Faculty.findOne({ regNo: req.body.regNo });
    if (faculty) {
      return res.status(400).json({ error: "Sorry a faculty with this Reg No already exists" })
    }
    // Check whether the faculty with this email exists already
    faculty = await Faculty.findOne({ email: req.body.email });
    if (faculty) {
      return res.status(400).json({ error: "Sorry a faculty with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);


    faculty = await Faculty.create({
      name: req.body.name,
      password: secPass,
      phone_number: req.body.phone_number,
      email: req.body.email,
      office_location: req.body.office_location,
      role:req.body.role
    });
    const data = {
      faculty: {
        id: faculty.id,
        phone_number: faculty.phone_number,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a faculty using: POST "/api/faculty/login". facultyUI
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
    let faculty = await Faculty.findOne({ email });
    if (!faculty) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, faculty.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      faculty: {
        id: faculty.id,
        name: faculty.name,
        phone_number: faculty.phone_number,
        email: faculty.email,
        office_location: faculty.office_location
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


// ROUTE 3: Get  faculty Details using: POST "/api/faculty/getfaculty". facultyUI
router.get('/getfaculty', fetchfaculty, async (req, res) => {

  try {
    const facultyId = req.faculty.id;
    const faculty = await Faculty.findById(facultyId).select("-password")
    res.send(faculty)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Update an existing faculty using: PUT "/api/faculty/updatefaculty". facultyUI
router.put('/updatefaculty',
  fetchfaculty, async (req, res) => {
    const { name, email, phone_number,office_location } = req.body;
    try {
      const newfaculty = {};
      if (name) { newfaculty.name = name };
      if (office_location) { newfaculty.office_location = office_location };
      if (email) {
        let faculty = await Faculty.findOne({ email: req.body.email });
        if (faculty) {
          if (faculty.id != req.faculty.id) {
            return res.status(400).json({ error: "Sorry a faculty with this email already exists" })
          }
        }
        newfaculty.email = email
      };
      if (phone_number) {
        let faculty = await Faculty.findOne({ phone_number: req.body.phone_number });
        if (faculty) {
          if (faculty.id != req.faculty.id) {
            return res.status(400).json({ error: "Sorry a faculty with this phone number already exists" })
          }
        }
        newfaculty.phone_number = phone_number
      };
      // Find the faculty to be updated and update it
      let faculty = await Faculty.findById(req.faculty.id);
      if (!faculty) { return res.status(404).send("Not Found") }

      faculty = await Faculty.findByIdAndUpdate(req.faculty.id, { $set: newfaculty }, { new: true })
      const data = {
        faculty: {
          id: faculty.id,
          name: faculty.name,
          phone_number: faculty.phone_number,
          email: faculty.email,
          office_location: faculty.office_location,
          role:faculty.role,
        }
      }
      res.json({ data });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
// ROUTE 5: change Password a faculty using: POST "/api/faculty/changepassword". facultyUI
//takes oldpassword,newpassword,facultyid
router.post('/changepassword', [
  body('oldpassword', 'old password cannot be blank').exists(),
  body('newpassword', 'New password cannot be blank').exists(),
], fetchfaculty, async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldpassword, newpassword } = req.body;
  try {
    let faculty = await Faculty.findById(req.faculty.id);
    if (!faculty) {
      success = false
      return res.status(400).json({ error: "faculty not Exists" });
    }

    const passwordCompare = await bcrypt.compare(oldpassword, faculty.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please Enter Correct old Password" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newpassword, salt);
    faculty.password = secPass

    let facultyr = await Faculty.findByIdAndUpdate(req.faculty.id, { $set: faculty }, { new: true })
    success = true;
    res.json({ success, facultyr })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 6: email send  using: POST "/api/faculty/sendemail". facultyUI
//takes email in body
router.post('/sendemail', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let faculty = await Faculty.findOne({ email: req.body.email });
    if (!faculty) {
      success = false
      return res.status(400).json({ error: "faculty with this email not Exists" });
    }
    let generatedotp = Math.floor((Math.random() * 10000) + 1)
    const data = await Faculty.updateOne({ email: req.body.email }, { $set: { otp: generatedotp } })

    sendmail(faculty.name, faculty.email, generatedotp)
    success = true
    res.json({ success, msg: "Email Sent Successfully" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});

//ROUTE 7: verify otp using: POST "/api/faculty/updatepassword". facultyUI
//takes email,otp,password in body
router.post('/updatepassword', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const faculty = await Faculty.findOne({ email: req.body.email })
    if (faculty.otp == req.body.otp) {
      const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    faculty.password = secPass

    let facultyr = await Faculty.findByIdAndUpdate(faculty.id, { $set: faculty }, { new: true })
    success = true;
    res.json({ success, msg: "Password Changed Successfully" })
    }
    res.json({ success, msg: "OTP Not Verified" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 8: Get all faculty members Details using: POST "/api/faculty/getallfaculty". facultyUI
router.get('/getallfaculty', async (req, res) => {

  try {
    const faculty = await Faculty.find().select("-password")
    res.send(faculty)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
// ROUTE 9: Delete an existing faculty using: DELETE "/api/faculty/deletefaculty".
router.delete('/deletefaculty/:id', async (req, res) => {
  try {
      let stalls = []
      let faculty = await Faculty.findById(req.params.id);
      if (!faculty) { return res.status(404).send("Not Found") }
      faculty = await Faculty.findByIdAndDelete(req.params.id)
     
      res.json({ "Success": "faculty has been deleted", faculty: faculty });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})



module.exports = router