const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const {createUser} = require("../controllers/userControllers");


const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRole(["admin"]),
    createUser
);

module.exports = router;