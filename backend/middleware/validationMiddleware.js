const validateCreateUser = (req,res,next)=> {
    const {
        employee_number,
        password,
        name,
        role,
        hire_date
    } = req.body;
    

    if (typeof employee_number !== "string" ||
        typeof password !== "string"||
        typeof name !== "string" ||
        typeof role !== "string" ||
        typeof hire_date !== "string" 
    ) {
        return res.status(400).json({message:"All fields are required"});
    }
    const trimmedEmployeeNumber = employee_number.trim();
    
    if (password !== password.trim()) {
    return res.status(400).json({
        message: "Password cannot start or end with spaces."
    });

    if (password.trim() === "") {
    return res.status(400).json({
        message: "Password is required"
    });
    }
    }

    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedHireDate = hire_date.trim();

    if(trimmedEmployeeNumber ===""||
        password ===""||
        trimmedName === "" ||
        trimmedRole === "" ||
        trimmedHireDate ===""
    ){
        return res.status(400).json({message:"All fields are required"});
    }
        if(password.length < 8){
            return res.status(400).json({message:"Password must be at least 8 characters"});
        }

        const allowedRoles = ["admin", "manager", "staff"];

          if (!allowedRoles.includes(trimmedRole)) {
                return res.status(400).json({
            message: "Role must be admin, manager, or staff"
        });
    }
        const employeeNumberPattern = /^E\d{4}$/;

        if(!employeeNumberPattern.test(trimmedEmployeeNumber)){
            return res.status(400).json({
            message: "Employee number must follow the format E0001"
        });
        
        
       
        } const date = new Date(trimmedHireDate);

        if (isNaN(date.getTime())){
                return res.status(400).json({message:"Invalid hire date"});
        }

        

        req.body.employee_number = trimmedEmployeeNumber;
        req.body.password = password;
        req.body.name = trimmedName;
        req.body.role = trimmedRole;
        req.body.hire_date = trimmedHireDate;

    next();

};

const validateUpdateUser = (req,res,next)=>{
const {
        name,
        role,
        hire_date
    } = req.body;
    

    if (
        typeof name !== "string" ||
        typeof role !== "string" ||
        typeof hire_date !== "string" 
    ) {
        return res.status(400).json({message:"Name, role, hire_date fields are required"});
    }

    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedHireDate = hire_date.trim();

    if(
        trimmedName === "" ||
        trimmedRole === "" ||
        trimmedHireDate ===""
    ){
        return res.status(400).json({message:"Name, role, hire_date fields are required"});
    }
        
        const allowedRoles = ["admin", "manager", "staff"];

          if (!allowedRoles.includes(trimmedRole)) {
                return res.status(400).json({
            message: "Role must be admin, manager, or staff"
        });
        
        } const date = new Date(trimmedHireDate);

        if (isNaN(date.getTime())){
                return res.status(400).json({message:"Invalid hire date"});
        }
        req.body.name = trimmedName;
        req.body.role = trimmedRole;
        req.body.hire_date = trimmedHireDate;

    next();
};

const validateUpdatePassword = (req,res,next) =>{
const {
        password,     
    } = req.body;
    
    if (
        typeof password !== "string"
    ) {
        return res.status(400).json({message:"Password required"});
    }
    
    if (password !== password.trim()) {
    return res.status(400).json({
        message: "Password cannot start or end with spaces."
    });

    if (password.trim() === "") {
    return res.status(400).json({
        message: "Password is required"
    });
    }   
    }

    if(password.length < 8){
        return res.status(400).json({message:"Password must be at least 8 characters"});
    }

    next();

};

module.exports ={ validateCreateUser,
    validateUpdateUser,
    validateUpdatePassword
};