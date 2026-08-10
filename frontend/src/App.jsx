import { useState } from 'react';
import {Routes,Route,NavLink,Navigate,useNavigate} from "react-router-dom";

import PrivateRoute from './components/PrivateRoute';

import Login from "./pages/Login";
import ProductList from "./pages/ProductList";
import CustomerList  from './pages/CustomerList';
import OrderList from "./pages/OrderList";

function App() {
  const navigate = useNavigate();
  const [isLoggedIn,setIsLoggedIn] 
    = useState(localStorage.getItem("token") !== null);
  
  function handleLogin(){
    setIsLoggedIn(true);
    navigate("/products");
  }
  function handleLogout(){
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  }
      return(
    <>
    {isLoggedIn? (
      <>
      <nav>
        <NavLink to = "/products" 
        className={({isActive})=>isActive?"primary-button":"secondary-button"}>Products</NavLink>

        <NavLink to = "/customers" 
        className={({isActive})=>isActive?"primary-button":"secondary-button"}>Customers</NavLink>

        <NavLink to = "/orders"
        className={({isActive})=>isActive?"primary-button":"secondary-button"}>Orders</NavLink>

       <button type = "button" className="danger-button"
        onClick={handleLogout}>Log Out</button>
        
      </nav>

      <Routes>
        <Route path ="/" element={
        isLoggedIn
            ? <Navigate to="/products" replace />
            : <Login onLogin={handleLogin} />
        }/>
        <Route path = "/products" element = {<PrivateRoute isLoggedIn={isLoggedIn}>
          <ProductList onLogout={handleLogout}/></PrivateRoute> }/>
        <Route path = "/customers" element = {<PrivateRoute isLoggedIn={isLoggedIn}>
          <CustomerList onLogout={handleLogout}/></PrivateRoute>}/>
        <Route path = "/orders" element = {<PrivateRoute isLoggedIn={isLoggedIn}>
        <OrderList onLogout={handleLogout}/></PrivateRoute>}/>
        <Route path = "*" element = {<h2>404 - Page Not Found</h2>}/>
      </Routes></>)
      :
      (<Login onLogin = {handleLogin}/>)
    }</>
  );
}

export default App
