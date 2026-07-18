const pool = require("../db");

const getCustumers = async (req,res) =>{
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
    
};

const createCustomer = async (req,res) => {
    try{
    const {name,email,phone,address} = req.body;
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
};

const updateCustomer = async(req,res)=>{
 
    try{
    const {id} = req.params;
    const {name, email, phone, address} = req.body;
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
        res.status(500).json({message: `Server Error`});
    }

};

const deleteCustomer = async(req,res)=>{

    try{
        const {id} = req.params;
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
};

module.exports = {
    getCustumers,
    createCustomer,
    updateCustomer,
    deleteCustomer
};