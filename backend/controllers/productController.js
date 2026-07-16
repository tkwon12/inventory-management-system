const pool = require("../db");

const getProducts = async (req,res)=>{
    try{
        const result = await pool.query("SELECT * FROM products ORDER BY id");
        res.json(result.rows);

    }catch(error){
        console.error(error);
        res.status(500).json({massage: "Server Error"});
    }

};

const createProduct = async(req,res) => {
    try{
        const {product_code, name, price, stock_quantity, shelf_location} = req.body;

        const result = await pool.query(
            `INSERT INTO products
            (product_code, name, price, stock_quantity, shelf_location)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *`,
            [product_code,name,price,stock_quantity,shelf_location]
    );
    res.status(201).json(result.rows[0]);

    }catch(error){
        console.error(error);
        res.status(500).json({massage:"Server Error"});

    }
};

const updateProduct = async(req,res) => { 
    try{
        const{id} = req.params;
        const{product_code, name, price, stock_quantity, shelf_location} = req.body;

        const result = await pool.query(
            `UPDATE products
            SET product_code = $1,
                name = $2,
                price = $3,
                stock_quantity = $4,
                shelf_location = $5
            WHERE id = $6
            RETURNING *
            `,
            [product_code,name,price,stock_quantity,shelf_location, id]
        );

        res.json(result.rows[0])
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"})

    }

};

const deleteProduct = async(req,res) => {
 try{
        const {id} = req.params;
        const result = await pool.query(
        `DELETE FROM products
        WHERE id = $1
        RETURNING *`,[id]);
        
        if(result.rows.length===0){
            return res.status(404).json({message:"Product not found"});
        }

        res.json(result.rows[0]);
    }catch(error){  
        res.status(500).json({message:"Server Error"})
    }
};
module.exports = { getProducts,
    createProduct,
    updateProduct,
    deleteProduct};