const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const { getCustumers, createCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    getCustumers

);

router.post(
    "/",
    authenticateToken,
    createCustomer
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRole(["admin","manager"]),
    updateCustomer
)

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole(["admin"]),
    deleteCustomer
)

module.exports = router;
