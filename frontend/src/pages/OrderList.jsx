import {useEffect,useState} from "react";

const API_URL = import.meta.env.VITE_API_URL;

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

  const [selectedOrder,setSelectedOrder] = useState(null);
  const [detailLoading,setDetailLoading] = useState(false);

  

  async function getOrder(){
    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");

    try{
        const response = await fetch(`${API_URL}/orders`,{
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

    const response = await fetch(`${API_URL}/customers`,{
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
    
    const response = await fetch(`${API_URL}/products`,{
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

    if(!customerId){
        setError("Please select customer first");
        return;
    }

    if (!selectedProductId||!quantity||Number(quantity)<1){
        setError("Please select a product and quantity");
        return;
    }

    const productId = Number(selectedProductId);
    const quantityNumber = Number(quantity);

    const selectedProduct = products.find(
        (product) => product.id === productId
    );


    

    if(!selectedProduct){
        setError("Selected product was not found");
        return;
    }

    const availableStock = getAvailableStock(selectedProduct)
    
    if(quantityNumber >  availableStock){
        setError(`Insufficient stock only ${availableStock} available.`);
        return;
    }

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
        unit_price: Number(selectedProduct.price),
        quantity : quantityNumber,
    };

    setOrderItems([...orderItems,newItem]);
}
    setSelectedProductId("");
    setQuantity("");
    setError("");
  }

  function removeOrderItem(productId){
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
    const response = await fetch(`${API_URL}/orders`,{
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
        const response = await fetch(`${API_URL}/orders/${orderId}`,{
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

  async function getOrderDetails(orderId){
    const token = localStorage.getItem("token");

    setDetailLoading(true);
    setError("");

    try{
        const response = await fetch(`${API_URL}/orders/${orderId}`,{
            method:"GET",
            headers:{
                Authorization:`Bearer ${token}`,
            }
        });
        const data = await response.json();

        if(response.ok){
            console.log("Order Details", data);
            console.log("First detail row", data[0]);
            setSelectedOrder(data);

        }else{
            setError(data.message||"Failed to load order details");
            if(response.status ===401 ||  response.status === 403){
                onLogout();
            }
        }
    }catch(error){
        console.error(error)
        setError("Server Error");

    }finally{
        setDetailLoading(false);
    }


  }

  function getAvailableStock(product){
    const existingItem = orderItems.find(
        (item)=> item.product_id === product.id
    );

    const reservedQuantity = existingItem? existingItem.quantity : 0;

    return product.stock_quantity - reservedQuantity;
  }

  const currentlySelectedProduct = products.find(
    (product)=>product.id === Number(selectedProductId)
  );

  const selectedAvailableStock = currentlySelectedProduct?
        getAvailableStock(currentlySelectedProduct): "";

  const selectedUnitPrice = currentlySelectedProduct? 
        Number(currentlySelectedProduct.price):
        0;

  const selectedItemTotal = selectedUnitPrice*Number(quantity||0);
  
  const estimatedOrderTotal = orderItems.reduce((total,item)=>
        total+ Number(item.unit_price)*item.quantity,0);

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
                    onChange={(event)=>setCustomerId(event.target.value)}
                    disabled = {orderItems.length>0}><option value = "">Select Customer</option>
                    {customers.map((customer)=>(<option key= {customer.id} value = {customer.id}>
                        {customer.name} - {customer.email}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="product">Product</label>
                    <select id = "product" value = {selectedProductId} 
                    onChange={(event) => setSelectedProductId(event.target.value)} 
                    ><option value ="">Select Product</option>
                    {products.map((product)=>{const availableStock = getAvailableStock(product); return(
                    <option key = {product.id} value = {product.id} disabled ={availableStock<1}>
                        {product.product_code} - {product.name} - {" "}(Avaliable:{availableStock})</option>);})}
                    </select>
                </div>
                <div>
                    <label htmlFor="quantity">Quantity</label>
                    <input id="quantity" type="number" min="1" max = {selectedAvailableStock} value={quantity}
                    onChange={(event)=>setQuantity(event.target.value)}/>
                    {currentlySelectedProduct&&(
                        <div>
                            <p>Unit Price: ${selectedUnitPrice.toFixed(2)}</p>
                            <p>Estimated Item Total: ${selectedItemTotal.toFixed(2)} </p>
                        </div>
                    )}
                </div>
                <button type = "button" onClick={addOrderItem} disabled={loading}>Add Item</button>
                        
                <h4>Order Items</h4>
                {orderItems.map((item,index)=>(<div key ={index}>
                <p>
                    {item.product_code} - {item.product_name}
                </p>
                <p>
                    Unit Price : ${Number(item.unit_price).toFixed(2)}
                </p>
                <p>   
                    Quantity : {item.quantity}
                </p>
                <p>
                    Item Total: $ {(Number(item.unit_price)*item.quantity).toFixed(2)}
                </p>
                

                <button type = "button" onClick={()=>{removeOrderItem(item.product_id)}}
                disabled={loading}> Remove </button>
                </div>
            ))}
                {orderItems.length>0 &&(<h4>
                    Estimated Order Total : ${estimatedOrderTotal.toFixed(2)}
                </h4>)}

                <button type = "submit" className="primary-button" disabled={loading || !customerId || orderItems.length === 0 }>
                Create Order</button>
                <button type ="button" onClick={()=>{setOrderItems([]); setCustomerId("");}} 
                disabled= {loading|| orderItems.length === 0}>Clear</button>
            </form>

            <h2>Orders</h2>
            <button type = "button" onClick={getOrder} disabled = {loading} >
                {loading? "Loading...":"Get Orders"}
            </button>
            {error && <p>{error}</p>}
            {orders.length === 0 ? (<p>No orders found.</p>): (<table>
                <thead>
                    <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Total Price</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                     {orders.map((order)=>(
                <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.employee_name}</td>
                    <td><span className={`status status-${order.order_status}`}>{order.order_status}</span></td>
                    <td>${Number(order.total_price).toFixed(2)}</td>
                    <td>{new Date(order.order_date).toLocaleString()}</td>
                    <td><button type="button" 
                    onClick={()=>{setOrderId(order.order_id);setStatus(order.order_status);}}>
                        Change Order</button> 
                    <button type = "button" className="info-button" onClick={()=>getOrderDetails(order.order_id)}>
                        {detailLoading? "Loading...":"View Details"}</button></td>
                 </tr>))}       
                </tbody>
            </table>)}
            

            {selectedOrder&& selectedOrder.length>0 &&(
                 <section>
                 <h3>Order Details </h3>
                <table>
                    <thead>
                        <tr>
                        <th>
                            Order ID
                        </th>
                        <th>
                            Customer
                        </th>
                        <th>
                            Employee
                        </th>
                        <th>
                            Status
                        </th>
                        <th>
                            Order Date
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>
                            {selectedOrder[0].order_id}
                        </td>
                        <td>
                            {selectedOrder[0].customer_name}
                        </td>
                        <td>
                           {selectedOrder[0].employee_name} 
                        </td>
                        <td>
                            {selectedOrder[0].order_status}
                        </td>
                        <td>
                            {selectedOrder[0].order_date}
                        </td>
                        </tr>
                    </tbody>
                </table>

                <h4>Items</h4>
                <table>
                    <thead>
                        <tr>
                        <th>
                            Product Code
                        </th>
                        <th>
                            Product
                        </th>
                        <th>
                            Quantity
                        </th>
                        <th>
                            Unit Price
                        </th>
                        <th>
                            Total Price
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        {selectedOrder.map((item,index)=>(
                        <tr key = {index}>
                            <td>{item.product_code}</td>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>${Number(item.unit_price).toFixed(2)}</td>
                            <td>${(Number(item.unit_price)*item.quantity).toFixed(2)}</td>
                        </tr>

                    ))}
                    </tbody>
                </table>
                    <button type="button" onClick={()=>setSelectedOrder(null)}>
                        Close Details
                    </button>
                </section>
            )}

            {orderId !==null &&(
                <form onSubmit = {updateOrder}>
                    <h3>Update Order Status</h3>
                    <label htmlFor = "orderStatus">Status</label>
                    <select id = "orderStatus" value = {status} onChange={(event)=>{setStatus(event.target.value)}}>
                        <option value = "pending">Pending</option>
                        <option value = "completed">Completed</option>
                        <option value = "cancelled">Cancelled</option>
                    </select>
                    <button type = "submit" className="primary-button" disabled = {loading}>Update Status</button>
                    <button type ="button" className="secondary-button" onClick={()=>{setOrderId(null); setStatus("");}}>
                        Cancel</button>
                </form>
            )}

            
        </section>

    </main>


    )
}

export default OrderList;