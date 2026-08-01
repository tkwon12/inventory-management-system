import {useEffect,useState} from "react";

function CustomerList({onLogout}){
    const [customers,setCustomers] = useState([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");

    
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [phone,setPhone] = useState("");
    const [address,setAddress] = useState("");

    const [editingCustomerId,setEditingCustomerId] = useState(null);
    const [editName,setEditName] = useState("");
    const [editEmail,setEditEmail] = useState("");
    const [editPhone,setEditPhone] = useState("");
    const [editAddress,setEditAddress] = useState("");

async function getCustomers(){
    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");
    try{
        const response = await fetch("http://localhost:3000/customers",{
            method:"GET",
            headers:{
                Authorization:`Bearer ${token}`,

            },
        });
        const data = await response.json();

        if(response.ok){
            console.log("Getting customers success");
            console.log(data);

            setCustomers(data);
        }else{
            setError(data.message||"Failed to load customers");
            if(response.status===401||response.status===403){
                onLogout();
            }
        }
    }catch(error){
            console.error(error);
            setError("Server Error");
    }finally{
        setLoading(false);
    }
}

async function createCustomer(event){
    event.preventDefault();
    const token = localStorage.getItem("token");
    
    setLoading(true);
    setError("");
    try{
        const response = await fetch("http://localhost:3000/customers",{
            method: "POST",
            headers : {
                "Content-type":"application/json",
                Authorization:`Bearer ${token}`,
            },
            body: JSON.stringify({
                name:name,
                email:email,
                phone:phone,
                address:address
            })
        })
        const data = await response.json();

        if(response.ok){
            console.log("Create customer success");
            console.log(data);
            
            setName("");
            setEmail("");
            setPhone("");
            setAddress("");

            await getCustomers();
        }else{
            console.log("Failed to create customer")
            setError(data.message||"Failed to create customer")
            if(response.status === 401||response.status===403){
                onLogout();
            }
        }

    }catch(error){
        console.error(error);
        setError("Server Erorr");
    }finally{
        setLoading(false);
    }
}
function startEditing(customer){
    setEditingCustomerId(customer.id);
    setEditName(customer.name);
    setEditEmail(customer.email);
    setEditPhone(customer.phone);
    setEditAddress(customer.address);


}

async function updateCustomer(event){
    event.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try{
        const response = await fetch(`http://localhost:3000/customers/${editingCustomerId}`,
            {method:"PUT",
                headers: {
                "Content-type":"application/json",
                Authorization:`Bearer ${token}`},
                body:JSON.stringify({
                    name:editName,
                    email:editEmail,
                    phone:editPhone,
                    address:editAddress
                })
            }
        )

        const data = await response.json();
        if(response.ok){
            console.log("Update customer info success");
            console.log(data);

            setEditingCustomerId(null);
            setEditName("");
            setEditPhone("");
            setEditEmail("");
            setEditAddress("");

            await getCustomers();
        }else{
            setError(data.message||"Fail to update customer info");
            if(response.status === 401 || response.status === 403){
                onLogout();
            }

        }
    }catch(error){
        console.error(error);
        setError("Server Error");
    }finally{
        setLoading(false);
    }
}
async function deleteCustomer(customerId){
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    try{
        const response = await fetch(`http://localhost:3000/customers/${customerId}`,
            {method:"DELETE",
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        )
        const data = await response.json();

        if(response.ok){
            console.log("Customer delete success");
            console.log(data);
            await getCustomers();
        }else{
            setError(data.message||"Failed to delete customer");
            if(response.status === 401||response.status === 403){
                onLogout();
            }
        }

    }catch(error){
        console.error(error);
        setError("Server Error");
    }finally{
        setLoading(false);
    }

}

useEffect(()=>{getCustomers();},[]);

return(
    <main>
        <section>
            <form onSubmit={createCustomer}>
                <h3>Add Customer</h3>
            <div>
                <label htmlFor="name">Name</label>
                <input id = "name" type="text" value = {name} 
                onChange={(event)=>{setName(event.target.value);}}/>
            </div>
            <div>
                <label htmlFor="email">E-mail</label>
                <input id = "email" type = "text" value = {email}
                onChange = {(event)=>{setEmail(event.target.value);}}/>
            </div>
            <div>
                <label htmlFor="phone">Phone Number</label>
                <input id = "phone" type = "text" value={phone}
                onChange={(event)=>{setPhone(event.target.value)}}/>
            </div>
            <div>
                <label htmlFor="address">Address</label>
                <input id ="address" type ="text" value={address}
                onChange={(event)=>{setAddress(event.target.value)}}/>
            </div>
            <button type ="submit" disabled = {loading} >Add Customer</button>
            </form>

            <h2>Customers</h2>
            <button type="button" onClick={getCustomers} 
            disabled = {loading}>{loading? "Loading...":"Get Customers"}</button>
            {error&&<p>{error}</p>}
            {customers.map((customer)=>(
                <div key = {customer.id}>
                    <p>name:{customer.name}</p>
                    <p>Email:{customer.email}</p>
                    <p>Phone:{customer.phone}</p>
                    <p>Address:{customer.address}</p>
                    <button type = "button" disabled={loading} 
                    onClick={()=>startEditing(customer)}>Edit</button>
                    <button type = "button" disabled={loading} 
                    onClick={()=>deleteCustomer(customer.id)}>Delete</button>
                </div>
            
            ))}

            {editingCustomerId !== null &&(
                <form onSubmit={updateCustomer}>
                    <h3>Edit Customer</h3>
                    <div>
                        <label htmlFor="editName">Name</label>
                        <input id = "editName" type = "text" value = {editName}
                         onChange={(event)=>{setEditName(event.target.value)}}/>
                    </div>
                    <div>
                        <label htmlFor="editEmail">E-mail</label>
                        <input id="editEmail" type = "text" value = {editEmail}
                        onChange={(event)=>{setEditEmail(event.target.value)}}/>
                    </div>
                    <div>
                        <label htmlFor="editPhone">Phone Number</label>
                        <input id = "editPhone" type = "text" value = {editPhone}
                        onChange={(event)=>{setEditPhone(event.target.value)}}/>
                    </div>
                    <div>
                        <label htmlFor="editAddress">Address</label>
                        <input id="editAddress" type="text" value={editAddress}
                        onChange={(event)=>{setEditAddress(event.target.value)}}/>
                    </div>

                <button type="submit" disabled={loading}>Update Customer</button>
                <button type="button" disabled={loading} onClick={()=>setEditingCustomerId(null)}>
                    Cancel
                </button>
                </form>
            )}

        </section>

    </main>
)
}
export default CustomerList;