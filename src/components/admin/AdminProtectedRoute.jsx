import React from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminProtectedRoute() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.is_superuser) {
        return (
            <div className="admin-forbidden-container">
                <div className="admin-forbidden-card">
                    <div className="forbidden-icon">🚫</div>
                    <h2>403 - Access Forbidden</h2>
                    <p>Superuser privileges are required to access the Store Admin Panel.</p>
                    <p className="user-info-text">
                        Logged in as: <strong>{user?.email || user?.username}</strong> (Customer Account)
                    </p>
                    <div className="forbidden-actions">
                        <Link to="/" className="btn btn-primary">
                            Return to Store
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                <AdminSidebar />
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
