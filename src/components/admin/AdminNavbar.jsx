import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="admin-navbar">
            <div className="admin-navbar-inner">
                <div className="admin-brand-group">
                    <Link to="/admin" className="admin-brand">
                        <span className="brand-accent">Eco</span>Shop <span className="admin-badge">Admin</span>
                    </Link>
                </div>

                <div className="admin-navbar-actions">
                    <div className="admin-user-pill">
                        <span className="user-dot"></span>
                        <span>{user?.first_name || user?.username || "Superuser"}</span>
                    </div>

                    <Link to="/" className="btn btn-sm btn-outline-beige">
                        🌐 View Storefront
                    </Link>

                    <button onClick={handleLogout} className="btn btn-sm btn-danger">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
