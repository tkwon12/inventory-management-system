const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");

const productRouter = require("./routes/productRoutes");


const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products",productRouter);

app.get("/",(req,res) =>{
    res.send("Inventory Management API is running");
}
);



app.post("/orders", authenticateToken, async(req,res)=>{
    const client = await pool.connect();
    try{
        const {customer_id, items} = req.body;
        const user_id = req.user.id;
        await client.query("BEGIN");

        const orderresult = await client.query(
            `INSERT INTO orders (customer_id, user_id, order_status)
            VALUES ($1,$2,'pending')
            RETURNING *
            `,[customer_id, user_id]
        );
        const order = orderresult.rows[0];

        for (const item of items){
            const {product_id, quantity} = item;

            const productresult = await client.query(
                `SELECT id, price, stock_quantity
                FROM products
                WHERE id = $1`,
                [product_id]
            );

            if (productresult.rows.length === 0 ){
                throw new Error(`Product ${product_id} not found`);
            }

            const product = productresult.rows[0];

            if (product.stock_quantity<quantity){
                throw new Error(`Not enough stock for product ${product_id}`);
            }

            await client.query(
                `INSERT INTO order_items(order_id, product_id, quantity, unit_price)
                VALUES ($1,$2,$3,$4)
                `,[order.id, product_id,quantity,product.price]
            );
            await client.query(
                `UPDATE products 
                SET stock_quantity = stock_quantity - $1
                WHERE id = $2`,[quantity,product_id]
            );
        }
        await client.query(`COMMIT`);
        
        res.status(201).json({
            message: "Order created successfully",
            order,
            });

    }catch(error){
        await client.query(`ROLLBACK`);
        console.error(error);
        res.status(400).json({message:error.message});

    } finally{
        client.release();
    }
});

app.get("/orders",authenticateToken,async(req,res)=>{
    try{
        const result = await pool.query(
        
        `SELECT 
            o.id AS order_id,
            c.name AS customer_name,
            u.name AS employee_name,
            SUM(oi.quantity * oi.unit_price) AS total_price,
            o.order_status,
            o.order_date
        FROM orders o
        JOIN customer c
        ON o.customer_id = c.id
        JOIN users u 
        ON o.user_id = u.id
        JOIN order_item oi
        ON o.id = oi.order_id
        GROUP BY 
        o.id,
        c.name,
        u.name,
        o.order_status,
        o.order_date
        ORDER BY o.order_date DESC`
        );
    
        res.json(result.rows);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });

    }
});

app.get("/orders/:id",authenticateToken,async(req,res)=>{
    try{
        const{id} = req.params;
        const result = await pool.query(
            `SELECT 
                o.id AS order_id,
                c.name AS customer_name,
                u.name AS employee_name,
                p.name AS product_name,
                oi.quantity,
                oi.unit_price,
                o.order_date,
                o.order_status
            FROM orders o 
            JOIN customers c 
                ON o.customer_id = c.id
            JOIN users u 
                ON o.user_id = u.id
            JOIN order_items oi
                ON o.id = oi.order_id
            JOIN products p 
                ON oi.product_id = p.id
            WHERE o.id = $1
            `,[id]
        );
        res.json(result.rows);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
});

app.put("/orders/:id/status",authenticateToken,authorizeRole(["admin","manager"]),async(req,res)=>{

    try{
        const{id} = req.params;
        const{order_status} = req.body;
        const result = await pool.query(
            `UPDATE orders
            SET order_status = $1
            WHERE id = $2
            RETURNING *
            `,[order_status,id]

        );
        if(result.length===0){
          return  res.status(404).json({message: "Order not found"});
        }
        res.json(result.rows[0]);


    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/customers",authenticateToken,async(req,res)=>{
    try{
        const result = await pool.query(
            `SELECT *
            FROM customers
            ORDER BY id`
        );
        res.json(result.rows);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
    
});

app.post("/customers",authenticateToken,async(req,res)=>{
    try{const {name,email,phone,address} = req.body;
    const result = await pool.query(
        `INSERT INTO customers (name,email,phone,address)
         VALUES ($1,$2,$3,$4)
         RETURNING *
        `,[name,email,phone,address]
    );
    res.status(201).json(result.rows[0]);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
});

app.put("/customers/:id",async(req,res)=>{
    const {id} = req.params;
    
    const {name, email, phone, address} = req.body;
    try{
    const result = await pool.query(
        `UPDATE customers
        SET name = $1,
            email = $2,
            phone = $3,
            address = $4
        WHERE id = $5
        RETURNING *
        `,[name,email,phone,address,id]
    );
        if(result.rows.length === 0){
            return res.status(404).json({message:`${id} not found`});
        }
        res.json(result.rows[0]);
    }catch(error){
        console.error(error);
        res.status(500).json({massage: `Server Error`});
    }


});

app.delete("/customers/:id",async(req,res)=>{
    const {id} = req.params;
    try{
        const result = await pool.query(
            `DELETE FROM customers
            WHERE id = $1
            RETURNING *`,[id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({message:`${id} not found`});
        }
        res.json(result.rows[0]);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Errror"});
    }
});

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