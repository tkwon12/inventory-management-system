import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Login({onLogin}){
   const [employeeNumber, setEmployeeNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
   
     async function handlesubmit(event){
        event.preventDefault();
        setError("");

        try{
        const response = await fetch(`${API_URL}/auth/login`,{
            method : "POST",
            headers: {
                "Content-Type" :"application/json"
            }, body: JSON.stringify({employee_number:employeeNumber,password:password})
        });

        const data = await response.json();

        

        if(response.ok){
            localStorage.setItem("token",data.token);
            console.log("login success");
            console.log("Saved token",localStorage.getItem("token"));
            onLogin();
        }else{
            console.log("login fail");
            setError(data.message || "Login failed");
        }}catch(error){
            console.error(error);
            setError("Cannot connect to server");
        }
    }

   

return(
    <main>
       
        <form onSubmit={handlesubmit}>
        <h1>Inventory Management System</h1>
        <p>Employee Login </p>
        <div>
            <label htmlFor="employeeNumber">Employee Number</label>
            <input id="employeeNumber" type="text" value = {employeeNumber} 
            onChange={(event)=>{setEmployeeNumber(event.target.value)}}></input>
        </div>
        <div>
            <label htmlFor = "password">Password</label>
            <input id = "password" type = "password" value = {password}
            onChange = {(event)=>{setPassword(event.target.value)}}></input>
            
        </div>
        <button type="submit">Login</button>
        {error&&<p>{error}</p>}
        </form>         
    </main>
)
}

export default Login;