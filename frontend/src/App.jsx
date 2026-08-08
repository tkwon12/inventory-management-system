import { useState } from 'react';
import {Routes,Route} from "react-router-dom";

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
        <button type = "button" className=
        {currentPage==="products"?"primary-button":"secondary-button"} 
        onClick={()=>setCurrentPage("products")}>Products</button>
        <button type = "button" className=
        {currentPage==="customers"?"primary-button":"secondary-button"} 
        onClick={()=>setCurrentPage("customers")}>Customers</button>
        <button type = "button" className=
        {currentPage==="orders"?"primary-button":"secondary-button"} 
        onClick = {()=>setCurrentPage("orders")}>Orders</button>
        <button type = "button" className="danger-button"
        onClick={handleLogout}>Log Out</button>
        
      </nav>
      <Routes>
        <Route path = "/products" element = {<ProductList onLogout={handleLogout}/>}/>
        <Route path = "/customers" element = {<CustomerList onLogout={handleLogout}/>}/>
        <Route path = "/orders" element = {<OrderList onLogout={handleLogout}/>}/>
      </Routes>
      :
      (<Login onLogin = {handleLogin}/>)
    }</>
  );
}

export default App
