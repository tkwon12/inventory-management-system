const pool = require("../db");

const createOrder = async (req,res) =>{
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
        if(client){
        client.release();
    }
    }

};

const getOrders = async (req,res) => {
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
        JOIN customers c
        ON o.customer_id = c.id
        JOIN users u 
        ON o.user_id = u.id
        JOIN order_items oi
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
};

const getOrderById = async(req,res) => {
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

        if(result.rows.length===0){
            return res.status(404).json({
                message:"Order not found"
                });
        }
        res.json(result.rows);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
};

const updateOrder = async(req,res) => {
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
        if(result.rows.length===0){
          return  res.status(404).json({message: "Order not found"});
        }
        res.json(result.rows[0]);


    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder
}