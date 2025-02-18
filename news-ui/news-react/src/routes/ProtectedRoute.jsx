import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("key");

    if (!isAuthenticated) {
        return <Navigate to="login" />;
    }

    return children;
};

export default ProtectedRoute;
