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


const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products",productRouter);
app.use("/customers",customerRouter);
app.use("/orders",orderRouter);

app.get("/",(req,res) =>{
    res.send("Inventory Management API is running");
}
);



app.post("/auth/register",async(req,res)=>{
    try{
        const {employee_number,password,name,role,hire_date} = req.body;
        const password_hash = await bcrypt.hash(password,10);
        const result = await pool.query(
        
            `INSERT INTO users (employee_number, password_hash, name, role, hire_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING  id,
            employee_number,
            name,
            role,
            hire_date,
            created_at`,[employee_number,password_hash,name,role,hire_date]
        );

        res.json(result.rows[0]);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
});

app.post("/auth/login",async(req,res)=>{
    try{
        const {employee_number,password} = req.body;
        const result = await pool.query(
            `SELECT *
            FROM users
            WHERE employee_number = $1`,[employee_number]
        );
        
        if(result.rows.length === 0){
            return res.status(404).json({message:"Invalid credentials"});
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(401).json({message:"Invalid credenctials"});
        }
        const token = jwt.sign({
            id: user.id,
            employee_number: user.employee_number,
            role: user.role

        },process.env.JWT_SECRET,
        {expiresIn:'1h'}
    );
        res.json({
            message: "Login Successful",
            token,
            user:{
                id: user.id,
                employee_number: user.employee_number,
                name: user.name,
                role: user.role
            }
        });
        
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)});