const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const { getProducts,createProduct,updateProduct,deleteProduct } = require("../controllers/productController");

const router = express.Router();



router.get(
    "/",
    authenticateToken,
    getProducts
);

router.post(
    "/",
    authenticateToken,
    authorizeRole(["admin","manager"]),
    createProduct

);

router.put(
    "/:id",
    authenticateToken,
    authorizeRole(["admin","manager"]),
    updateProduct
    
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole(["admin"]),
    deleteProduct

);

module.exports = routers;
