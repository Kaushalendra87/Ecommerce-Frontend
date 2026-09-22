import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatPrice = (price) => {
        return `Rs. ${parseFloat(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClass = (status) => {
        const map = {
            pending: "status-pending",
            processing: "status-processing",
            shipped: "status-shipped",
            delivered: "status-delivered",
            cancelled: "status-cancelled",
        };
        return map[status] || "status-pending";
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get("/order_list/");
            setOrders(res.data);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load orders. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Loading
    if (loading) {
        return (
            <div className="page-container">
                <h1 className="page-title">My Orders</h1>
                <LoadingSpinner message="Loading your order history..." />
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="page-container">
                <h1 className="page-title">My Orders</h1>
                <ErrorMessage message={error} onRetry={fetchOrders} />
            </div>
        );
    }

    // Empty
    if (orders.length === 0) {
        return (
            <div className="page-container">
                <h1 className="page-title">My Orders</h1>
                <EmptyState
                    icon="📦"
                    title="No orders yet"
                    description="You haven't placed any orders yet. Start shopping and your order history will show up here!"
                    actionText="Browse Products →"
                    actionTo="/products"
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title">My Orders</h1>

            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order.id} className="order-card">
                        {/* Order Header */}
                        <div className="order-header">
                            <div className="order-header-left">
                                <h3 className="order-id">
                                    Order #{order.id}
                                </h3>
                                <span className="order-date">
                                    {formatDate(order.created_at)}
                                </span>
                            </div>
                            <div className="order-header-right">
                                <span
                                    className={`order-status ${getStatusClass(
                                        order.status
                                    )}`}
                                >
                                    {order.status.charAt(0).toUpperCase() +
                                        order.status.slice(1)}
                                </span>
                                <span className="order-total">
                                    {formatPrice(order.total_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="order-items">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="order-item-row"
                                >
                                    {/* Product Image */}
                                    {item.product?.image ? (
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="order-item-img"
                                        />
                                    ) : (
                                        <div className="order-item-img-placeholder">
                                            📦
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="order-item-info">
                                        <Link
                                            to={`/products/${item.product?.slug}`}
                                            className="order-item-name"
                                        >
                                            {item.product?.name}
                                        </Link>
                                        <span className="order-item-meta">
                                            {formatPrice(item.price)} × {item.quantity}
                                        </span>
                                    </div>

                                    {/* Item Subtotal */}
                                    <div className="order-item-subtotal">
                                        {formatPrice(item.sub_total)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Footer */}
                        <div className="order-footer">
                            <span className="order-item-count">
                                {order.items.length}{" "}
                                {order.items.length === 1 ? "item" : "items"}
                            </span>
                            <span className="order-footer-total">
                                Total: {formatPrice(order.total_amount)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Orders;