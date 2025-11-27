import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return <p>Carregando...</p>;
  }

  return children;
};

export default PrivateRoute;
