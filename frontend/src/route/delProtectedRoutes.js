import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const DelProtectedRoutes = ({ children }) => {
  const { isAuthenticated, loading, user, error } = useSelector(
    (state) => state.user
  );

  console.log(isAuthenticated);

  if (!loading) {
    if (!isAuthenticated ) {
     return <Navigate to="/login" />;
    }
  } 

  return children;
};

export default DelProtectedRoutes;
