const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const Order_Menu = require('../models/Order_Menu');

// ROUTE 1: Add new menu using: POST "/api/menu/addmenu". 
router.post('/addmenu', async (req, res) => {
    try {
        const { productName, qty,price,stallId,status,type } = req.body;

        // If there are errors, return Bad request and the error
        let menu = await Menu.create({
            productName: productName,
            qty: qty,
            price:price,
            stall:stallId,
            status:status,
            type:type
            
        });

        res.json({ menu, success: true })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 2: get all Menu using: GET "/api/menu/getallmenu". 
router.get('/getallmenu', async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 3: get all Menu by stall using: GET "/api/menu/getallmenubystall". 
router.post('/getallmenubystall', async (req, res) => {
    try {
        const menu = await Menu.find({stall:req.body.stallId});
        res.json(menu)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Update an existing menu using: PUT "/api/menu/updatemenu". 
router.put('/updatemenu/:id', async (req, res) => {
    const { productName, qty,price,stallId,status,type } = req.body;
    try {
        // Create a newmenu object
        const newmenu = {};
        if (productName) { newmenu.productName = productName };
        if (qty) { newmenu.qty = qty };
        if (price) { newmenu.price = price };
        if (stallId) { newmenu.stallId = stallId };
        if (status) { newmenu.status = status };
        if (type) { newmenu.type = type };
        // Find the menu to be updated and update it
        let menu = await Menu.findById(req.params.id);
        if (!menu) { return res.status(404).send("Not Found") }

        menu = await Menu.findByIdAndUpdate(req.params.id, { $set: newmenu }, { new: true })
        res.json({ menu });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 5: Delete an existing menu using: DELETE "/api/menu/deletemenu".
router.delete('/deletemenu/:id', async (req, res) => {
    try {
        let stalls = []
        let menu = await Menu.findById(req.params.id);
        if (!menu) { return res.status(404).send("Not Found") }
        menu = await Menu.findByIdAndDelete(req.params.id)
        let order_menu=await Order_Menu.find({menu:menu._id})
        for(let i=0;i<order_menu.length;i++){
            let a=await Order_Menu.findByIdAndDelete(order_menu[i]._id)
        }
        res.json({ "Success": "menu has been deleted", menu: menu });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router