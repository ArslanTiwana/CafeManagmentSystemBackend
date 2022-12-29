const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const Stall = require('../models/Stall');

// ROUTE 1: Add new Cafe using: POST "/api/cafe/addcafe". 
router.post('/addcafe', async (req, res) => {
    try {
        const { name, location } = req.body;

        // If there are errors, return Bad request and the error
        let cafe = await Cafe.create({
            name: name,
            location: location,
        });

        res.json({ cafe, success: true })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 2: get all Cafe using: GET "/api/cafe/getallcafe". 
router.get('/getallcafe', async (req, res) => {
    try {
        const cafes = await Cafe.find();
        res.json(cafes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 3: Update an existing cafe using: PUT "/api/cafe/updatecafe". 
router.put('/updatecafe/:id', async (req, res) => {
    const { name, location } = req.body;
    try {
        // Create a newcafe object
        const newcafe = {};
        if (name) { newcafe.name = name };
        if (location) { newcafe.location = location };

        // Find the cafe to be updated and update it
        let cafe = await Cafe.findById(req.params.id);
        if (!cafe) { return res.status(404).send("Not Found") }

        cafe = await Cafe.findByIdAndUpdate(req.params.id, { $set: newcafe }, { new: true })
        res.json({ cafe });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing cafe using: DELETE "/api/cafe/deletecafe".
router.delete('/deletecafe/:id', async (req, res) => {
    try {
        let stalls = []
        let cafe = await Cafe.findById(req.params.id);
        if (!cafe) { return res.status(404).send("Not Found") }
        cafe = await Cafe.findByIdAndDelete(req.params.id)
        stalls = await Stall.find({ cafe: cafe._id })
        for (let i = 0; i < stalls.length; i++) {
            stalls[i].cafe = null
            let stall = await Stall.findByIdAndUpdate(stalls[i]._id, { $set: stalls[i] }, { new: true })
        }
        res.json({ "Success": "cafe has been deleted", cafe: cafe });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router