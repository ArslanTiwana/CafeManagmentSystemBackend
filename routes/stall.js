const express = require('express');
const Cafe = require('../models/Cafe');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const router = express.Router();
const Stall = require('../models/Stall');
const StallOwner = require('../models/StallOwner');
const Order_Menu = require('../models/Order_Menu');


// ROUTE 1: Add new stall using: POST "/api/stall/addstall". 
router.post('/addstall',async (req, res) => {
    try {
        const {name,location,cafeId,stallOwnerId} = req.body; 
        let stall = await Stall.create({
            name: name,
            location: location,
            cafe:cafeId,
            stall_owner:stallOwnerId
          });
        res.json({stall,success:true})
          // If there are errors, return Bad request and the error
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 2: get all stall using: GET "/api/stall/getallstall". 
router.get('/getallstall',async (req, res) => {
        try {
            const stalls = await Stall.find();
        //      console.log(stalls);
        //     let allstalls=[]
        //     let stallOwnerIds=[]
        //     let cafeIds=[]
        //     let stallOwners=[]
        //     let cafes=[]


        //     for(let a=0;a<stalls.length;a++){
        //         stallOwnerIds[a]=stalls[a].stall_owner
        //     }
        //     stallOwners = await StallOwner.find({_id:{ $in : stallOwnerIds }})
        //     for(let a=0;a<stalls.length;a++){
        //         cafeIds[a]=stalls[a].cafe
        //     }
        //     cafes = await Cafe.find({_id:{ $in : cafeIds }})
        //     for(let i=0;i<stalls.length;i++){
        //         allstalls[i]={

        //         }
        //     console.log(cafes);
        //     res.json({stalls:stalls,stallOwners:stallOwners,cafes:cafes})
        // }
            res.json(stalls)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })
// ROUTE 3: get all stall by cafe using: GET "/api/stall/getallstallbycafe". 
router.post('/getallstallbycafe',async (req, res) => {
    const { cafeId } = req.body;
    try {
        const stalls = await Stall.find({cafe:cafeId});
        res.json(stalls)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 4: get all stall by stallOwner using: GET "/api/stall/getallstallbystallowner". 
router.post('/getallstallbystallowner',async (req, res) => {
    const { stallOwnerId } = req.body;
    try {
        const stalls = await Stall.find({stall_owner:stallOwnerId});
        res.json(stalls)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 5: Update an existing stall using: PUT "/api/stall/updatestall". 
router.put('/updatestall/:id', async (req, res) => {
    const { name,location,cafeId,stallOwnerId } = req.body;
    try {
        // Create a newstall object
        const newstall = {};
        if (name) { newstall.name = name };
        if (location) { newstall.location = location };
        if (cafeId) { newstall.cafe = cafeId };
        if (stallOwnerId) { newstall.stall_owner = stallOwnerId };

        // Find the stall to be updated and update it
        let stall = await Stall.findById(req.params.id);
        if (!stall) { return res.status(404).send("Not Found") }
        stall = await Stall.findByIdAndUpdate(req.params.id, { $set: newstall }, { new: true })
        res.json({ stall });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 6: Delete an existing stall using: DELETE "/api/stall/deletestall".
router.delete('/deletestall/:id',async (req, res) => {
    try {
        let stall = await Stall.findById(req.params.id);
       
        if (!stall) { return res.status(404).send("Not Found") }
        stall = await Stall.findByIdAndDelete(req.params.id)
        let menus=await Menu.find({stall:stall._id})
        for(let i=0;i<menus.length;i++){
            let a=await Menu.findByIdAndDelete(menus[i]._id)
            let order_menu=await Order_Menu.find({menu:a._id})
            console.log(order_menu[0]);
            for(let j=0;j<order_menu.length;j++){
                let l=await Order_Menu.findByIdAndDelete(order_menu[j]._id)
            }
        }
        let orders=await Order.find({stall:stall._id})
        for(let i=0;i<orders.length;i++){
            let a=await Order.findByIdAndDelete(orders[i]._id)
        }
        res.json({ Success: true, stall: stall });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router