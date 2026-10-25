import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-merino">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-venice-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-venice-blue text-sm font-semibold tracking-wide">
            Consulting the catalogue...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <ForbiddenPage requiredRoles={allowedRoles} userRole={user.role} />;
  }

  return children;
};
