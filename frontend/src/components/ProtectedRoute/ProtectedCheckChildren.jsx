import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export const ProtectedCheckChildren = ({ children }) => {
  const { allUser, user } = useAuth();
  if (allUser?.data?.user?.check == true || user?.check == true) {
    return <Navigate to="/dashboard" />;
  }
  if (user == null && allUser.data.confirmationCode === "") {
    return <Navigate to="/login" />;
  }
  return children;
};

import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    
    console.log("Usuario autenticado");
    navigate("/dashboard"); // Redirige a la página de Dashboard
  };

  return (
    <div>
      <h1>Página de Inicio de Sesión</h1>
      <button onClick={handleLogin}>Iniciar Sesión</button>
    </div>
  );
};

export default Login;