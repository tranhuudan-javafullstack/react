import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteLogin = ({ children }) => {
    const isAuthenticated = localStorage.getItem("key");

    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default ProtectedRouteLogin;
