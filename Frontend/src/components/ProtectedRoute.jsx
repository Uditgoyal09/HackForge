import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userString = localStorage.getItem('user');
  
  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user doesn't have the right role, send them to their own dashboard
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
