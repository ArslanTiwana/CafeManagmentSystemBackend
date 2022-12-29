const express = require('express');
const Menu = require('../models/Menu');
const router = express.Router();
const Order = require('../models/Order');
const Order_Menu = require('../models/Order_Menu');
// ROUTE 1: Add new order using: POST "/api/order/addorder". 
router.post('/addorder', async (req, res) => {
    try {
        const { facultyId, studentId, stallId, status, type, menuIds } = req.body;
        console.log(menuIds);
        // If there are errors, return Bad request and the error
        let order = await Order.create({
            faculty: facultyId,
            student: studentId,
            stall: stallId,
            status: status,
            type: type
        });
        for (i = 0; i < menuIds.length; i++) {
            let order_menu = await Order_Menu.create({
                menu: menuIds[i].menu,
                qty: menuIds[i].qty,
                order: order._id
            });
        }

        res.json({ order, success: true })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 2: get all order using: GET "/api/order/getallorder". 
router.get('/getallorder', async (req, res) => {
    try {
        let allorders = []
        const orders = await Order.find();
        for (let i = 0; i < orders.length; i++) {
            const order_menu = await Order_Menu.find({ order: orders[i]._id })
            let menus = []
            let menu = []
            let menuIds = []
            for (let j = 0; j < order_menu.length; j++) {
                menuIds[j] = order_menu[j].menu
            }
            menus = await Menu.find({ _id: { $in: menuIds } })
            for (let j = 0; j < menus.length; j++) {
                menu[j] = {
                    menu: menus[j],
                    qty: order_menu[j].qty
                }
            }
            allorders[i] = {
                order: orders[i],
                menus: menu
            }
        }
        res.json(allorders)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 3: get all order by stall using: GET "/api/order/getallorderbystall". 
router.post('/getallorderbystall', async (req, res) => {
    try {
        let allorders = []
        const orders = await Order.find({ stall: req.body.stallId });
        for (let i = 0; i < orders.length; i++) {
            const order_menu = await Order_Menu.find({ order: orders[i]._id })
            let menus = []
            let menu = []
            let menuIds = []
            for (let j = 0; j < order_menu.length; j++) {
                menuIds[j] = order_menu[j].menu
            }
            menus = await Menu.find({ _id: { $in: menuIds } })
            for (let j = 0; j < menus.length; j++) {
                menu[j] = {
                    menu: menus[j],
                    qty: order_menu[j].qty
                }
            }
            allorders[i] = {
                order: orders[i],
                menus: menu
            }
        }
        res.json(allorders)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 4: get all order by student using: GET "/api/order/getallorderbystudent". 
router.post('/getallorderbystudent', async (req, res) => {
    try {
        let allorders = []
        const orders = await Order.find({ student: req.body.studentId });
        for (let i = 0; i < orders.length; i++) {
            const order_menu = await Order_Menu.find({ order: orders[i]._id })
            let menus = []
            let menu = []
            let menuIds = []
            for (let j = 0; j < order_menu.length; j++) {
                menuIds[j] = order_menu[j].menu
            }
            menus = await Menu.find({ _id: { $in: menuIds } })
            for (let j = 0; j < menus.length; j++) {
                menu[j] = {
                    menu: menus[j],
                    qty: order_menu[j].qty
                }
            }
            allorders[i] = {
                order: orders[i],
                menus: menu
            }
        }
        res.json(allorders)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
// ROUTE 5: get all order by faculty using: GET "/api/order/getallorderbyfaculty". 
router.post('/getallorderbyfaculty', async (req, res) => {
    try {
        let allorders = []
        const orders = await Order.find({ faculty: req.body.facultyId });
        for (let i = 0; i < orders.length; i++) {
            const order_menu = await Order_Menu.find({ order: orders[i]._id })
            let menus = []
            let menu = []
            let menuIds = []
            for (let j = 0; j < order_menu.length; j++) {
                menuIds[j] = order_menu[j].menu
            }
            menus = await Menu.find({ _id: { $in: menuIds } })
            for (let j = 0; j < menus.length; j++) {
                menu[j] = {
                    menu: menus[j],
                    qty: order_menu[j].qty
                }
            }
            allorders[i] = {
                order: orders[i],
                menus: menu
            }
        }
        res.json(allorders)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 6: Update an existing order using: PUT "/api/order/updateorder". 
router.put('/updateorder/:id', async (req, res) => {
    const { status, type, prepairationTime } = req.body;
    try {
        // Create a neworder object
        const neworder = {};
        if (prepairationTime) { neworder.prepairation_time = prepairationTime };
        if (status) { neworder.status = status };
        if (type) { neworder.type = type };
        // Find the order to be updated and update it
        let order = await Order.findById(req.params.id);
        if (!order) { return res.status(404).send("Not Found") }

        order = await Order.findByIdAndUpdate(req.params.id, { $set: neworder }, { new: true })
        res.json({ order });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 7: Delete an existing order using: DELETE "/api/order/deleteorder".
router.delete('/deleteorder/:id', async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        if (!order) { return res.status(404).send("Not Found") }
        order = await Order.findByIdAndDelete(req.params.id)
        let order_menu=await Order_Menu.find({order:order._id})
        console.log(order_menu);
        for(let i=0;i<order_menu.length;i++){
            let a=await Order_Menu.findByIdAndDelete(order_menu[i]._id)
        }
        res.json({ "Success": "order has been deleted", order: order });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router