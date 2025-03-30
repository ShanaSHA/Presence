import React from "react";
import { Navigate,Outlet } from "react-router-dom";
const PrivateRoute=({allowedRoles=[]})=>{
    const token=localStorage.getItem("accessToken");
    const role=localStorage.getItem("userRole")
    console.log('Token:',token);
    if(!token){
        return<Navigate to="/" replace />;
    }
    return allowedRoles.length===0||allowedRoles.includes(role)?(
       <Outlet/>):(
        <Navigate to="/"replace/>
       );
    };
    export default PrivateRoute;
