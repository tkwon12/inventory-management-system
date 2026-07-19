const pool = require("../db");
const bcrypt = require("bcrypt");

const createUser = async(req,res) =>{
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
        return res.status(201).json({message:"User created successfully",user:result.rows[0]});
    }catch(error){
        console.error(error);

        if(error.code === "23505"){
            return res.status(409).json({message:"Employee number already exists"});
        }
        return res.status(500).json({message:"Server Error"});
    }
};

module.exports = {createUser};