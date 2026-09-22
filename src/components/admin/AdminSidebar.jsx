import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link");

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <nav className="admin-nav">
                <div className="admin-nav-section-title">Core Management</div>
                <NavLink to="/admin" end className={linkClass}>
                    <span className="nav-icon">📊</span>
                    <span>Dashboard Overview</span>
                </NavLink>
                <NavLink to="/admin/products" className={linkClass}>
                    <span className="nav-icon">📦</span>
                    <span>Products Catalog</span>
                </NavLink>
                <NavLink to="/admin/categories" className={linkClass}>
                    <span className="nav-icon">📂</span>
                    <span>Categories</span>
                </NavLink>
                
                <div className="admin-nav-section-title mt-4">Sales & Operations</div>
                <NavLink to="/admin/orders" className={linkClass}>
                    <span className="nav-icon">🛒</span>
                    <span>Customer Orders</span>
                </NavLink>
                <NavLink to="/admin/users" className={linkClass}>
                    <span className="nav-icon">👥</span>
                    <span>Users & Staff</span>
                </NavLink>
                <NavLink to="/admin/reviews" className={linkClass}>
                    <span className="nav-icon">⭐</span>
                    <span>Reviews Moderation</span>
                </NavLink>

                <div className="admin-nav-divider"></div>
                <NavLink to="/" className="admin-nav-link nav-link-store">
                    <span className="nav-icon">🛍️</span>
                    <span>Back to Customer Store</span>
                </NavLink>
            </nav>
        </aside>
    );
}
