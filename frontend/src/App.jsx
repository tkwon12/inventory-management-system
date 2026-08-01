import { useState } from 'react';
import Login from "./pages/Login";
import ProductList from "./pages/ProductList";
import CustomerList  from './pages/CustomerList';
import OrderList from "./pages/OrderList";

function App() {
  const [isLoggedIn,setIsLoggedIn] 
    = useState(localStorage.getItem("token") !== null);
  const [currentPage,setCurrentPage] = useState("products");
  function handleLogin(){
    setIsLoggedIn(true);
  }
  function handleLogout(){
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }
      return(
    <>
    {isLoggedIn? (
      <>
      <nav>
        <button type = "button" onClick={()=>setCurrentPage("products")}>Products</button>
        <button type = "button" onClick={()=>setCurrentPage("customers")}>Customers</button>
        <button type = "button" onClick = {()=>setCurrentPage("orders")}>Orders</button>
        <button type = "button" onClick={handleLogout}>Log Out</button>
        
      </nav>
      {currentPage === "products" && (<ProductList onLogout = {handleLogout}/>)}
      {currentPage ==="customers" && (<CustomerList onLogout={handleLogout}/>)}
      {currentPage === "orders" && (<OrderList onLogout = {handleLogout}/>)}</>)
      
      :
      (<Login onLogin = {handleLogin}/>)
    }</>
  );
}

export default App
