const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const { validateCreateUser, validateUpdateUser, validateUpdatePassword } = require("../middleware/validationMiddleware");
const {createUser,getUser,updateUser, updateUserPassword,deleteUser} = require("../controllers/userController");


const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRole(["admin"]),
    validateCreateUser,
    createUser
);

router.get(
    "/",
    authenticateToken,
    authorizeRole(["admin"]),
    getUser
)

router.put(
    "/:id",
    authenticateToken,
    authorizeRole(["admin"]),
    validateUpdateUser,
    updateUser
)

router.put(
    "/:id/password",
    authenticateToken,
    authorizeRole(["admin"]),
    validateUpdatePassword,
    updateUserPassword
)

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole(["admin"]),
    deleteUser
)

module.exports = router;