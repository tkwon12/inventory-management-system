const pool = require("../db");

const getCostumers = async (req,res) =>{
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

const 