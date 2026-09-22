import React, { useEffect, useState } from "react";
import { getOrders, getOrder, updateOrderStatus } from "../../services/adminApi";

const STATUS_CHOICES = [
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getOrders({ page_size: 200 });
            setOrders(res.data.results ?? res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load customer orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const openDetails = async (id) => {
        try {
            const res = await getOrder(id);
            setSelected(res.data);
            setStatusUpdate(res.data.status || "pending");
        } catch (err) {
            console.error(err);
            alert("Failed to load order details");
        }
    };

    const handleStatusUpdate = async () => {
        if (!selected) return;
        setUpdatingStatus(true);
        try {
            await updateOrderStatus(selected.id, { status: statusUpdate });
            setSelected((prev) => (prev ? { ...prev, status: statusUpdate } : null));
            loadOrders();
        } catch (err) {
            console.error(err);
            alert("Failed to update order status");
        } finally {
            setUpdatingStatus(false);
        }
    };

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

    const filteredOrders = orders.filter((o) =>
        statusFilter === "all" ? true : o.status === statusFilter
    );

    if (loading && orders.length === 0) return <div className="admin-loading">Loading orders...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>Order Management</h2>
                    <p className="admin-subtitle">Track, inspect, and update customer order statuses</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <div className="admin-filter-group">
                        <label>Filter Status:</label>
                        <select
                            className="form-input form-input-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_CHOICES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <span className="admin-count-badge">{filteredOrders.length} orders</span>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="admin-empty-state">No orders found matching the criteria.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((o) => (
                                    <tr key={o.id}>
                                        <td><strong>#{o.id}</strong></td>
                                        <td>
                                            <div>
                                                <div className="admin-item-title">
                                                    {o.user?.first_name || o.user?.username || "Customer"}
                                                </div>
                                                <div className="admin-item-sub">{o.user?.email || "-"}</div>
                                            </div>
                                        </td>
                                        <td className="font-bold">NRs. {parseFloat(o.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td>{getStatusBadge(o.status)}</td>
                                        <td>{new Date(o.created_at).toLocaleString()}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline" onClick={() => openDetails(o.id)}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal admin-modal-lg">
                        <div className="admin-modal-header">
                            <h3>Order #{selected.id} Details</h3>
                            <button className="admin-modal-close" onClick={() => setSelected(null)}>&times;</button>
                        </div>
                        
                        <div className="admin-modal-body">
                            <div className="order-details-grid">
                                <div className="order-info-block">
                                    <div className="info-label">Customer Name</div>
                                    <div className="info-val">{selected.user?.first_name} {selected.user?.last_name} ({selected.user?.username})</div>
                                </div>
                                <div className="order-info-block">
                                    <div className="info-label">Customer Email</div>
                                    <div className="info-val">{selected.user?.email}</div>
                                </div>
                                <div className="order-info-block">
                                    <div className="info-label">Order Date</div>
                                    <div className="info-val">{new Date(selected.created_at).toLocaleString()}</div>
                                </div>
                                <div className="order-info-block">
                                    <div className="info-label">Total Amount</div>
                                    <div className="info-val font-bold">NRs. {parseFloat(selected.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>

                            <div className="order-status-update-section">
                                <label className="font-bold">Update Order Status:</label>
                                <div className="status-update-controls">
                                    <select
                                        className="form-input"
                                        value={statusUpdate}
                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                    >
                                        {STATUS_CHOICES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleStatusUpdate}
                                        disabled={updatingStatus}
                                    >
                                        {updatingStatus ? "Updating..." : "Save Status"}
                                    </button>
                                </div>
                            </div>

                            <h4 className="mt-4 mb-2">Order Items</h4>
                            <div className="table-responsive">
                                <table className="admin-table admin-table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.items?.map((it) => (
                                            <tr key={it.id}>
                                                <td>
                                                    <div className="admin-table-item">
                                                        {it.product?.image && (
                                                            <img src={it.product.image} alt={it.product.name} className="admin-thumb-sm" />
                                                        )}
                                                        <span>{it.product?.name || it.product?.title || "Product"}</span>
                                                    </div>
                                                </td>
                                                <td>NRs. {parseFloat(it.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                <td>{it.quantity}</td>
                                                <td className="font-bold">NRs. {parseFloat(it.sub_total || it.price * it.quantity || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="admin-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
