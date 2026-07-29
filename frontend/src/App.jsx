import { useState } from 'react';
import Login from "./pages/Login";
import ProductList from "./pages/ProductList";

function App() {
  const [isLoggedIn,setIsLoggedIn] 
    = useState(localStorage.getItem("token") !== null);
  function handleLogin(){
    setIsLoggedIn(true);
  }
  function handleLogout(){
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }
      return(
    <>
    {isLoggedIn? (<ProductList onLogout = {handleLogout}/>):(<Login onLogin = {handleLogin}/>)}
    </>
  );
}

export default App
