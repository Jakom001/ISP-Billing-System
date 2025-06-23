// ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import WaveLoading from './common/WaveLoading';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { currentUser, loading, isAuthenticated, checkAuthStatus } = useAuthContext();
    const navigate = useNavigate();

    // Monitor authentication status changes
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log('Authentication lost, redirecting to login');
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // While checking authentication status, show loading spinner
    if (loading) {
        return (
            <div className="flex flex-col items-center py-8 mt-8 z-50">
                <WaveLoading />
                <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // If admin-only route, check if user is admin
    if (adminOnly && currentUser?.role !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
    }
    
    // If authenticated (and admin if required), render the child routes
    return <Outlet />;
};

export default ProtectedRoute;