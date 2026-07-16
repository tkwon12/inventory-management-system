const jwt = require("jsonwebtoken");

const authenticateToken = (req,res,next)=>{
    const auHeader = req.headers.authorization;
     

    if (!auHeader){
        return res.status(401).json({message:"Access token required"});
    }
    const token = auHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({message:"Access token required"});
    }

    jwt.verify(token, process.env.JWT_SECRET, (error,decodedUser)=>{
        if(error){
            return res.status(403).json({message:"Invalid or expired token"});
        }
        req.user = decodedUser;
        next();
    });

};

module.exports = authenticateToken;
