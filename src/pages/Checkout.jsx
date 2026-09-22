import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function Checkout() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [placing, setPlacing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    const formatPrice = (price) => {
        return `Rs. ${parseFloat(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get("/cart/");
            setCart(res.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setCart(null);
            } else {
                setError(getErrorMessage(err, "Failed to load your cart. Please try again."));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handlePlaceOrder = async () => {
        setPlacing(true);
        setError(null);
        try {
            const res = await axiosInstance.post("/place_order/");
            // Backend already clears cart items in place_order view
            setOrderSuccess(res.data);
            // Navigate to orders after short delay so user sees success message
            setTimeout(() => navigate("/orders"), 1800);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to place order. Please try again."));
            setPlacing(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="page-container">
                <h1 className="page-title">Checkout</h1>
                <LoadingSpinner message="Preparing your checkout cart..." />
            </div>
        );
    }

    // Order placed successfully
    if (orderSuccess) {
        return (
            <div className="page-container">
                <div className="checkout-success">
                    <span className="checkout-success-icon">✓</span>
                    <h2>Order Placed Successfully!</h2>
                    <p>
                        Your order <strong>#{orderSuccess.id}</strong> has been
                        placed. Total:{" "}
                        <strong>
                            {formatPrice(orderSuccess.total_amount)}
                        </strong>
                    </p>
                    <p className="checkout-success-redirect">
                        Redirecting to your order history…
                    </p>
                    <Link to="/orders" className="btn-view-orders">
                        View My Orders →
                    </Link>
                </div>
            </div>
        );
    }

    // Error state on initial fetch
    if (error && !cart) {
        return (
            <div className="page-container">
                <h1 className="page-title">Checkout</h1>
                <ErrorMessage message={error} onRetry={fetchCart} />
            </div>
        );
    }

    // Empty cart
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="page-container">
                <h1 className="page-title">Checkout</h1>
                <EmptyState
                    icon="🛒"
                    title="Your cart is empty"
                    description="Add some products to your cart before checking out."
                    actionText="Browse Products →"
                    actionTo="/products"
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Checkout</h1>

            {/* Error Alert during placing order */}
            {error && <ErrorMessage message={error} />}

            <div className="checkout-layout">
                {/* Order Items */}
                <div className="checkout-items-section">
                    <h2 className="checkout-section-title">
                        Order Items ({cart.total_quantity}{" "}
                        {cart.total_quantity === 1 ? "item" : "items"})
                    </h2>

                    <div className="checkout-items-list">
                        {cart.items.map((item) => {
                            const product = item.product;
                            return (
                                <div key={item.id} className="checkout-item-row">
                                    {/* Product Image */}
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="checkout-item-img"
                                        />
                                    ) : (
                                        <div className="checkout-item-img-placeholder">
                                            📦
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="checkout-item-info">
                                        <div className="checkout-item-name">
                                            {product.name}
                                        </div>
                                        <div className="checkout-item-meta">
                                            {formatPrice(product.price)} × {item.quantity}
                                        </div>
                                        {product.category && (
                                            <div className="checkout-item-category">
                                                {product.category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Subtotal */}
                                    <div className="checkout-item-subtotal">
                                        {formatPrice(item.sub_total)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Link to="/cart" className="checkout-back-link">
                        ← Back to Cart
                    </Link>
                </div>

                {/* Order Summary Sidebar */}
                <div className="checkout-summary">
                    <h2>Order Summary</h2>

                    <div className="summary-row">
                        <span className="label">Items</span>
                        <span className="value">{cart.total_quantity}</span>
                    </div>

                    <div className="summary-row">
                        <span className="label">Subtotal</span>
                        <span className="value">
                            {formatPrice(cart.cart_total)}
                        </span>
                    </div>

                    <div className="summary-row">
                        <span className="label">Shipping</span>
                        <span
                            className="value"
                            style={{ color: "var(--success)" }}
                        >
                            Free
                        </span>
                    </div>

                    <div className="summary-total">
                        <span className="label">Total</span>
                        <span className="value">
                            {formatPrice(cart.cart_total)}
                        </span>
                    </div>

                    <button
                        className="btn-place-order"
                        onClick={handlePlaceOrder}
                        disabled={placing}
                    >
                        {placing ? (
                            <>
                                <span className="btn-spinner"></span>
                                Placing Order…
                            </>
                        ) : (
                            "Place Order"
                        )}
                    </button>

                    <p className="checkout-secure-note">
                        🔒 Secure checkout
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
