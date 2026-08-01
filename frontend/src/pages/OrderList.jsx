import {useEffect,useState} from "react";


function OrderList({onLogout}){

  const[orders,setOrders] = useState([]); 

  const [customerId,setCustomerId] = useState("");
  const [orderItems,setOrderItems] = useState([]);
  
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const [customers,setCustomers]=useState([]);
  const [products,setProducts]=useState([]);
  
  const [selectedProductId,setSelectedProductId]=useState("");
  const [quantity,setQuantity] = useState("");

  const [orderId,setOrderId] = useState(null);
  const [status,setStatus] = useState("");

  async function getOrder(){
    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");

    try{
        const response = await fetch("http://localhost:3000/orders",{
            method: "GET",
            headers:{
               
                Authorization : `Bearer ${token}`,
            }, 
        })
        const data = await response.json();

        if(response.ok){
            console.log("Getting orders success");
            console.log(data);

            setOrders(data);
        }else{
            setError(data.message||"Faild to get orders");

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

  async function getCustomers(){
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/customers",{
        method:"GET",
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    const data = await response.json();
    if(response.ok){
    setCustomers(data);}
  }
  
  async function getProducts(){
    const token = localStorage.getItem("token");
    
    const response = await fetch("http://localhost:3000/products",{
        method:"GET",
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    const data = await response.json();
    if(response.ok){
        setProducts(data);
    }
  }
  function addOrderItem(){
    if (!selectedProductId||!quantity||Number(quantity)<1){
        setError("Please select a product and quantity");
        return;
    }

    const productId = Number(selectedProductId);
    const quantityNumber = Number(quantity);

    const selectedProduct = products.find(
        (product) => product.id === productId
    );

     

    const existingItem =  orderItems.find(
        (item) => item.product_id === productId
    );

    if(existingItem){
        setOrderItems(
            orderItems.map((item)=>(item.product_id===productId?{...item,quantity:item.quantity + quantityNumber,}
                :item
            )
        ));
    }else{

    const newItem ={
        product_id : productId,
        product_name: selectedProduct.name,
        product_code: selectedProduct.product_code,
        quantity : quantityNumber,
    };

    setOrderItems([...orderItems,newItem]);
}
    setSelectedProductId("");
    setQuantity("");
    setError("");
  }

  function removeOrderItem(){
    setOrderItems(
        orderItems.filter(
            (item)=>item.product_id !== productId
        )
    );

  }

  async function createOrder(event){
    event.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    const itemsForServer = orderItems.map((item)=>({
        product_id : item.product_id,
        quantity : item.quantity
    }));

    try{
    const response = await fetch("http://localhost:3000/orders",{
        method:"POST",
        headers:{"Content-type":"application/json",
                 Authorization:   `Bearer ${token}`,
        },body: JSON.stringify({
                customer_id:Number(customerId),
                items: itemsForServer
        })
    });
    const data = await response.json();

    if(response.ok){
        console.log("Create order success");
        console.log(data);
        setCustomerId("");
        setOrderItems([]);
        setSelectedProductId("");
        setQuantity("");
    
        await getOrder();
    }else{
        setError(data.message||"Failed to create order");
        if(response.status ===401 || response.status === 403){
            onLogout();
        }
    }}catch(error){
        console.error(error);
        setError("Server Error");
    }finally{
        setLoading(false);
    }
  }

  async function updateOrder(event){
    event.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try{
        const response = await fetch(`http://localhost:3000/orders/${orderId}`,{
            method:"PUT",
            headers:{
                "Content-type": "application/json",
                Authorization:`Bearer ${token}`
            },
            body: JSON.stringify({
                order_status:status
            })
        });

        const data = await response.json();
        
        if(response.ok){
            console.log("Update order success");
            console.log(data);
            setOrderId(null);
            setStatus("");

            await getOrder();
        }else{
            setError(data.message||"Failed to update order");
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

  useEffect(()=>{
    getOrder();
    getCustomers();
    getProducts();},[]);
  
  return(
    <main>
        <section>
            <form onSubmit={createOrder}>
                <h3>Create Order</h3>
                <div>
                    <label htmlFor="customer">Customer</label>
                    <select
                    id = "customer" value = {customerId} 
                    onChange={(event)=>setCustomerId(event.target.value)}><option value = "">Select Customer</option>
                    {customers.map((customer)=>(<option key= {customer.id} value = {customer.id}>
                        {customer.name} - {customer.email}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="product">Product</label>
                    <select id = "product" value = {selectedProductId} 
                    onChange={(event) => setSelectedProductId(event.target.value)}><option value ="">Select Product</option>
                    {products.map((product)=>(<option key = {product.id} value = {product.id}>
                        {product.product_code} - {product.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="quantity">Quantity</label>
                    <input id="quantity" type="number" min="1" value={quantity}
                    onChange={(event)=>setQuantity(event.target.value)}/>
                </div>
                <button type = "button" onClick={addOrderItem} disabled={loading}>Add Item</button>
                        
                <h4>Order Items</h4>
                {orderItems.map((item,index)=>(<p key ={index}>
                    {item.product_code} - {item.product_name},
                    Quantity : {item.quantity}
                </p>))}

                <button type = "submit" disabled={loading || !customerId || orderItems.length === 0 }>
                Create Order</button>
            </form>

            <h2>Orders</h2>
            <button type = "button" onClick={getOrder} disabled = {loading} >
                {loading? "Loading...":"Get Orders"}
            </button>
            {error && <p>{error}</p>}
            {orders.map((order)=>(
                <div key={order.order_id}>
                    <p>Order ID : {order.order_id}</p>
                    <p>Customer : {order.customer_name}</p>
                    <p>Employee : {order.employee_name}</p>
                    <p>Status : {order.order_status}</p>
                    <p>Total Price : {order.total_price}</p>
                    <p>Order Date : {order.order_date}</p>

                    <button type="button" 
                    onClick={()=>{setOrderId(order.order_id);setStatus(order.order_status);}}>
                        Change Order</button> 
                </div>
            ))}

            {orderId !==null &&(
                <form onSubmit = {updateOrder}>
                    <h3>Update Order Status</h3>
                    <label htmlFor = "orderStatus">Status</label>
                    <select id = "orderStatus" value = {status} onChange={(event)=>{setStatus(event.target.value)}}>
                        <option value = "pending">Pending</option>
                        <option value = "completed">Completed</option>
                        <option value = "cancelled">Cancelled</option>
                    </select>
                    <button type = "submit" disabled = {loading}>Update Status</button>
                    <button type ="button" onClick={()=>{setOrderId(null); setStatus("");}}>
                        Cancel</button>
                </form>
            )}

            
        </section>

    </main>


    )
}

export default OrderList;