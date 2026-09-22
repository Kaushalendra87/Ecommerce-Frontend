import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories, getOrders, getUsers, getReviews } from "../../services/adminApi";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        users: 0,
        reviews: 0,
        totalRevenue: 0,
        recentOrders: [],
    });

    useEffect(() => {
        let cancelled = false;

        async function fetchSummary() {
            setLoading(true);
            setError(null);
            try {
                const [pRes, cRes, oRes, uRes, rRes] = await Promise.all([
                    getProducts({ page_size: 1 }),
                    getCategories({ page_size: 1 }),
                    getOrders({ page_size: 10 }),
                    getUsers({ page_size: 1 }),
                    getReviews({ page_size: 1 }),
                ]);

                if (cancelled) return;

                const ordersData = oRes.data.results ?? oRes.data ?? [];
                const revenue = Array.isArray(ordersData)
                    ? ordersData.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0)
                    : 0;

                setSummary({
                    products: pRes.data.count ?? (Array.isArray(pRes.data) ? pRes.data.length : 0),
                    categories: cRes.data.count ?? (Array.isArray(cRes.data) ? cRes.data.length : 0),
                    orders: oRes.data.count ?? (Array.isArray(ordersData) ? ordersData.length : 0),
                    users: uRes.data.count ?? (Array.isArray(uRes.data) ? uRes.data.length : 0),
                    reviews: rRes.data.count ?? (Array.isArray(rRes.data) ? rRes.data.length : 0),
                    totalRevenue: revenue,
                    recentOrders: Array.isArray(ordersData) ? ordersData.slice(0, 5) : [],
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load administration overview statistics.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchSummary();
        return () => (cancelled = true);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "delivered":
                return <span className="badge badge-success">Delivered</span>;
            case "shipped":
                return <span className="badge badge-info">Shipped</span>;
            case "processing":
                return <span className="badge badge-warning">Processing</span>;
            case "cancelled":
                return <span className="badge badge-danger">Cancelled</span>;
            default:
                return <span className="badge badge-secondary">Pending</span>;
        }
    };

    if (loading) return <div className="admin-loading">Loading administration dashboard...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>Admin Dashboard Overview</h2>
                    <p className="admin-subtitle">Store performance stats and management quick-access</p>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-icon icon-products">📦</div>
                    <div className="stat-details">
                        <div className="stat-value">{summary.products}</div>
                        <div className="stat-label">Total Products</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon icon-categories">📂</div>
                    <div className="stat-details">
                        <div className="stat-value">{summary.categories}</div>
                        <div className="stat-label">Categories</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon icon-orders">🛒</div>
                    <div className="stat-details">
                        <div className="stat-value">{summary.orders}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon icon-users">👥</div>
                    <div className="stat-details">
                        <div className="stat-value">{summary.users}</div>
                        <div className="stat-label">Users Registered</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon icon-reviews">⭐</div>
                    <div className="stat-details">
                        <div className="stat-value">{summary.reviews}</div>
                        <div className="stat-label">Customer Reviews</div>
                    </div>
                </div>
            </div>

            <div className="admin-grid-two">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Recent Orders</h3>
                        <Link to="/admin/orders" className="admin-link-btn">
                            View All Orders &rarr;
                        </Link>
                    </div>

                    {summary.recentOrders && summary.recentOrders.length > 0 ? (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.recentOrders.map((o) => (
                                        <tr key={o.id}>
                                            <td><strong>#{o.id}</strong></td>
                                            <td>{o.user?.first_name || o.user?.username || o.user?.email || "-"}</td>
                                            <td className="font-bold">NRs. {parseFloat(o.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                            <td>{getStatusBadge(o.status)}</td>
                                            <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="admin-empty-state">No recent customer orders found.</div>
                    )}
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions-list">
                        <Link to="/admin/products" className="quick-action-item">
                            <span className="action-icon">➕</span>
                            <div>
                                <div className="action-title">Manage Products</div>
                                <div className="action-sub">Add new inventory or edit prices</div>
                            </div>
                        </Link>
                        <Link to="/admin/categories" className="quick-action-item">
                            <span className="action-icon">🏷️</span>
                            <div>
                                <div className="action-title">Manage Categories</div>
                                <div className="action-sub">Organize store taxonomy</div>
                            </div>
                        </Link>
                        <Link to="/admin/orders" className="quick-action-item">
                            <span className="action-icon">🚚</span>
                            <div>
                                <div className="action-title">Fulfill Orders</div>
                                <div className="action-sub">Update shipping and order statuses</div>
                            </div>
                        </Link>
                        <Link to="/admin/users" className="quick-action-item">
                            <span className="action-icon">🛡️</span>
                            <div>
                                <div className="action-title">User Permissions</div>
                                <div className="action-sub">Manage active accounts & staff roles</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
