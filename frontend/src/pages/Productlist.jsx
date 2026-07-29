import { useEffect,useState } from "react";

function ProductList({onLogout}){
    const [products,setProducts] = useState([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");

    const [name,setName] = useState("");
    const [price,setPrice] = useState("");
    const [stockQuantity,setStockQuantity] = useState("");
    
    async function getProducts(){
        const token = localStorage.getItem("token");
        setLoading(true);
        setError("");

        try{
            const response = await fetch("http://localhost:3000/products",
                {method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`,
                    }, 
                }
            );
            const data = await response.json();

            if(response.ok){
                console.log("Getting products list success");
                setProducts(data);
            }else{
                console.log("Getting products list fail");
                setError(data.message || "Faild to load products list");
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
async function createProduct(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");

    try{
        const response = await fetch("http://localhost:3000/products",{
            type:"POSt",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,

            },
            body: JSON.stringify({name: name,
                price: Number(price),
                stock_quantity : Number(stockQuantity),
            })
        })
        const data = await response.json();
        if(response.ok){
            console.log("Product creation success");
            console.log(data);
            setName("");
            setPrice("");
            setStockQuantity("");

            getProducts();
        }else{
            console.log("Product creation failed");
            setError(data.message||"Failed to create product");

            if(response.status === 401){
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
    useEffect(()=>{getProducts()},[])
    
    return(<main>
        <section>
            <form onSubmit = {createProduct}>
            <h3>Add product</h3>

            <div>
                <label htmlFor="productName">Product Name</label>
                <input id = "productName" 
                type = "text"
                value = {name}
                onChange={(event)=>{setName(event.target.value);}}/>
            </div>
            <div>
                <label htmlFor = "productPrice">Product Price</label>

                <input 
                id = "productPrice"
                type = "number"
                step = "0.01"
                value = {price}
                onChange={(event) => {setPrice(event.target.value)}} />
            </div>
            <div>
                <label htmlFor = "stockQuantity">Stock Quantity</label>
                <input id = "stockQuantity"
                type = "number"
                value = {stockQuantity}
                onChange={(event)=>{setStockQuantity(event.target.value)}}/>
        
            </div>
            <button type = "submit" disabled = {loading}>Add Product</button>
        </form>

            <h2>Products</h2>
            <button type = "button" onClick={onLogout}>Log out</button>

            <button type = "button" onClick={getProducts} disabled = {loading}>
                {loading? "Loading...": "Get Products"}
            </button>
            {error&&<p>{error}</p>}

            {products.map((product)=>(
                <div key = {product.id}>
                    <p>Name: {product.name}</p>
                    <p>Price: {product.price}</p>
                    <p>Stock: {product.stock_quantity}</p>
                </div>
            ))}
        </section>

        

    </main>

    );}

export default ProductList;
