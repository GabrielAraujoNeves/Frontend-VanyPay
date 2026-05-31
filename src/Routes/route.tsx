import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "../Pages/Login";
import Home from "../Pages/Home";


const AppRoute = () => {
    return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
          </Routes>
        </BrowserRouter>
    )
}

export default AppRoute;