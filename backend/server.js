const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");

const productRouter = require("./routes/productRoutes");
const customerRouter = require("./routes/customerRoutes");
const orderRouter = require("./routes/orderRoutes");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products",productRouter);
app.use("/customers",customerRouter);
app.use("/orders",orderRouter);
app.use("/users",userRouter);
app.use("/auth",authRouter);

app.get("/",(req,res) =>{
    res.send("Inventory Management API is running");
}
);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)});