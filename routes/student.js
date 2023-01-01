const express = require('express');
const Student = require('../models/Student');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchstudent = require('../middleware/fetchstudent');
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

// ROUTE 1: Create a student account using: POST "/api/student/createstudent". studentUI
router.post('/createstudent', [
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
    // Check whether the student with this phone_number exists already
    let student = await Student.findOne({ phone_number: req.body.phone_number });
    if (student) {
      return res.status(400).json({ error: "Sorry a student with this phone number already exists" })
    }
    // Check whether the student with this RegNo exists already
    student = await Student.findOne({ regNo: req.body.regNo });
    if (student) {
      return res.status(400).json({ error: "Sorry a student with this Reg No already exists" })
    }
    // Check whether the student with this email exists already
    student = await Student.findOne({ email: req.body.email });
    if (student) {
      return res.status(400).json({ error: "Sorry a student with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);


    student = await Student.create({
      name: req.body.name,
      password: secPass,
      phone_number: req.body.phone_number,
      email: req.body.email,
      regNo: req.body.regNo,
      role:req.body.role,
    });
    const data = {
      student: {
        id: student.id,
        phone_number: student.phone_number,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a student using: POST "/api/student/login". studentUI
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
    let student = await Student.findOne({ email });
    if (!student) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, student.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      student: {
        id: student.id,
        name: student.name,
        phone_number: student.phone_number,
        email: student.email,
        regNo: student.regNo,
        role:student.role,
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


// ROUTE 3: Get  student Details using: POST "/api/student/getstudent". studentUI
router.get('/getstudent', fetchstudent, async (req, res) => {

  try {
    const studentId = req.student.id;
    const student = await Student.findById(studentId).select("-password")
    res.send(student)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE 4: Update an existing student using: PUT "/api/student/updatestudent". studentUI
router.put('/updatestudent',
  fetchstudent, async (req, res) => {
    const { name, email, phone_number } = req.body;
    try {
      const newstudent = {};
      if (name) { newstudent.name = name };
      if (email) {
        let student = await Student.findOne({ email: req.body.email });
        if (student) {
          if (student.id != req.student.id) {
            return res.status(400).json({ error: "Sorry a student with this email already exists" })
          }
        }
        newstudent.email = email
      };
      if (phone_number) {
        let student = await Student.findOne({ phone_number: req.body.phone_number });
        if (student) {
          if (student.id != req.student.id) {
            return res.status(400).json({ error: "Sorry a student with this phone number already exists" })
          }
        }
        newstudent.phone_number = phone_number
      };
      // Find the student to be updated and update it
      let student = await Student.findById(req.student.id);
      if (!student) { return res.status(404).send("Not Found") }

      student = await Student.findByIdAndUpdate(req.student.id, { $set: newstudent }, { new: true })
      const data = {
        student: {
          id: student.id,
          name: student.name,
          phone_number: student.phone_number,
          email: student.email,
          regNo: student.regNo
        }
      }
      res.json({ data });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
// ROUTE 5: change Password a student using: POST "/api/student/changepassword". studentUI
//takes oldpassword,newpassword,studentid
router.post('/changepassword', [
  body('oldpassword', 'old password cannot be blank').exists(),
  body('newpassword', 'New password cannot be blank').exists(),
], fetchstudent, async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldpassword, newpassword } = req.body;
  try {
    let student = await Student.findById(req.student.id);
    if (!student) {
      success = false
      return res.status(400).json({ error: "student not Exists" });
    }

    const passwordCompare = await bcrypt.compare(oldpassword, student.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please Enter Correct old Password" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newpassword, salt);
    student.password = secPass

    let studentr = await Student.findByIdAndUpdate(req.student.id, { $set: student }, { new: true })
    success = true;
    res.json({ success, studentr })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 6: email send  using: POST "/api/student/sendemail". studentUI
//takes email in body
router.post('/sendemail', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let student = await Student.findOne({ email: req.body.email });
    if (!student) {
      success = false
      return res.status(400).json({ error: "student with this email not Exists" });
    }
    let generatedotp = Math.floor((Math.random() * 10000) + 1)
    const data = await Student.updateOne({ email: req.body.email }, { $set: { otp: generatedotp } })

    sendmail(student.name, student.email, generatedotp)
    success = true
    res.json({ success, msg: "Email Sent Successfully" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});

//ROUTE 7: verify otp using: POST "/api/student/updatepassword". studentUI
//takes email,otp,password in body
router.post('/updatepassword', async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const student = await Student.findOne({ email: req.body.email })
    if (student.otp == req.body.otp) {
      const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    student.password = secPass

    let studentr = await Student.findByIdAndUpdate(student.id, { $set: student }, { new: true })
    success = true;
    res.json({ success, msg: "Password Changed Successfully" })
    }
    res.json({ success, msg: "OTP Not Verified" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// ROUTE 8: Get all student Details using: get "/api/student/getallstudent". studentUI
router.get('/getallstudent', async (req, res) => {

  try {
    const student = await Student.find().select("-password")
    res.send(student)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router