const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder
} = require("../controllers/orderController");



const router = express.Router();


router.post( 
 "/",
 authenticateToken,
 createOrder
);

router.get(
    "/",
    authenticateToken,
    getOrders
);

router.get(
    "/:id",
    authenticateToken,
    getOrderById
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRole(["admin","manager"]),
    updateOrder

);

module.exports = router;