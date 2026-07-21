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

const getUser = async(req,res) => {
   try{ 
    const result = await pool.query(
        `SELECT id,
                employee_number,
                name,
                role,
                hire_date,
                created_at
        FROM users
        ORDER BY id ASC`

    );
    return res.status(200).json(result.rows);
    } catch(error){
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
};

const updateUser = async(req,res)=>{
    try{
        const {id} = req.params;
        const {name,role,hire_date} = req.body;
        const result = await pool.query(
            `UPDATE users u
             SET   
                name = $1,
                role = $2,
                hire_date = $3
            WHERE u.id = $4
            RETURNING   
                id,
                employee_number,
                name,
                role,
                hire_date,
                created_at`,[name,role,hire_date,id]
        )
        if(result.rows.length === 0){
            return res.status(404).json({message:"The user not found"});
        }
        
        return res.status(200).json(result.rows[0]);
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
};


const updateUserPassword = async(req,res) => {
    try{
        const {id} = req.params;
        const {password} = req.body;
        const password_hash = await bcrypt.hash(password,10);
        
        const result = await pool.query(
            `UPDATE users
            SET password_hash = $1
            WHERE id = $2
            RETURNING
                id,
                employee_number,
                name,
                role,
                hire_date,
                created_at
            `,[password_hash,id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({message:"The user not found"});
        }
        return res.status(200).json(result.rows[0]);
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
};

const deleteUser = async(req,res)=>{
    try{
    const{id} = req.params;
    const result = await pool.query(
        `DELETE FROM users u
        WHERE u.id = $1
         RETURNING
                id,
                employee_number,
                name,
                role,
                hire_date,
                created_at`,
            [id] 
    );
    if(result.rows.length === 0 ){
        return res.status(404).json({message:"User not found"});

    }

    return res.status(201).json({message:"User deleted successfully", user:result.rows[0]});
    } catch(error){
        if(error.code === "23503"){
            return res.status(409).json({message:"User cannot be deleted because they are referenced by existing orders"});
        }
        console.error(error);
        return res.status(500).json({message:"Server Error"});
    }
};


module.exports = {createUser,
                  getUser,
                  updateUser,  
                  updateUserPassword,
                  deleteUser
};