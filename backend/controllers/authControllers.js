const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const login = async (req,res) => {
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
};

module.exports = {login};