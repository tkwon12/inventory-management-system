import { useEffect,useState } from "react";


function ProductList({onLogout}){
    const [products,setProducts] = useState([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");

    const [name,setName] = useState("");
    const [price,setPrice] = useState("");
    const [stockQuantity,setStockQuantity] = useState("");
    const [productCode,setProductCode] = useState("");
    
    const [editingProductId,setEditingProductId]=useState(null);
    const [editName,setEditName] = useState("");
    const [editPrice,setEditPrice]=useState("");
    const [editStockQuantity,setEditStockQuantity] = useState("");
    const [editProductCode,setEditProductCode] = useState("");

    function startEditing(product){
        setEditingProductId(product.id);
        setEditProductCode(product.product_code);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditStockQuantity(product.stock_quantity);
    }
    
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
            method:"POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,

            },
            body: JSON.stringify({product_code: productCode, 
                name: name,
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
            setProductCode("");

            await getProducts();
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
async function updateProduct(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try{
        const response = await fetch(`http://localhost:3000/products/${editingProductId}`,{
            method:"PUT",
            headers:{
                "Content-type":"application/json",
                Authorization :`Bearer ${token}`,
            },
                body:JSON.stringify({
                    product_code:editProductCode,
                    name:editName,
                    price:Number(editPrice),
                    stock_quantity:Number(editStockQuantity),

                }),
            
        });
        const data = await response.json();

        if(response.ok){
            console.log("Product update success");
            console.log(data);

            setEditingProductId(null);
            setEditName("");
            setEditPrice("");
            setEditStockQuantity("");

            await getProducts();
        }else{
            setError(data.message||"Failed to update product");
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

async function deleteProduct(productId){
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try{
        const response = await fetch(`http://localhost:3000/${productId}`,{
            method: "DELETE",
            header: {
                Authorization : `Bearer ${token}`,

            },
                 
        }
        )
        const data = await response.json;

        if(response.ok){
            console.log("Product delete success");
            console.log(data);
            
            await getProducts();
        }else{
            setError(data.message||"Failed to delete product");

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
 useEffect(()=>{getProducts()},[])
    
    return(<main>
        <section>
            <form onSubmit = {createProduct}>
            <h3>Add product</h3>
            <div>
                <label htmlFor="productCode">Product Code</label>
                <input
                id = "productCode"
                type = "text"
                value = {productCode}
                onChange={(event)=>{setProductCode(event.target.value);}}/>
            </div>
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
           

            <button type = "button" onClick={getProducts} disabled = {loading}>
                {loading? "Loading...": "Get Products"}
            </button>
            {error&&<p>{error}</p>}

            {products.map((product)=>(
                <div key = {product.id}>
                    <p>Product Code: {product.product_code}</p>
                    <p>Name: {product.name}</p>
                    <p>Price: {product.price}</p>
                    <p>Stock: {product.stock_quantity}</p>

                <button type = "button" onClick={()=>startEditing(product)}>Edit</button>
                <button type = "button" onClick={()=>deleteProduct(product.id)} disabled = {loading}>Delete</button>
                </div>
            ))}

            {editingProductId !== null && (
                <form onSubmit = {updateProduct}>
                    <h3>Edit Product</h3>
                    <div>
                        <label htmlFor="editProductCode">Product Code</label>
                        <input id = "editProductCode"
                        type = "text"
                        value = {editProductCode}
                        readOnly/>

                    </div>
                    <div>
                        <label htmlFor="editName">Product Name</label>
                        <input
                        id = "editName"
                        type = "text"
                        value = {editName}
                        onChange={(event)=>{setEditName(event.target.value)}}/>

                    </div>
                    <div>
                        <label htmlFor = "editPrice">Product Price</label>
                        <input 
                        id = "editPrice"
                        type = "text"
                        value = {editPrice}
                        onChange={(event)=>{setEditPrice(event.target.value)}}/>
                    </div>

                    <div>
                        <label htmlFor = "editStockQuantity">Product Quantity</label>
                        <input id = "editStockQuantity"
                        type = "number"
                        step = "1"
                        value = {editStockQuantity}
                        onChange={(event)=>{setEditStockQuantity(event.target.value)}}/>
                    </div>

                    <button type = "submit" disabled={loading} > Update Product</button>
                    <button type = "button" onClick={()=>setEditingProductId(null)}>
                        Cancel
                    </button>

                </form>
            )}

        </section>

            
                    

    </main>

    );}

export default ProductList;
