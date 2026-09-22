import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [updatingItems, setUpdatingItems] = useState({});

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const formatPrice = (price) => {
        return `NRs. ${parseFloat(price).toLocaleString("en-IN", {
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
                // No cart exists yet — show empty state
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

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
        try {
            await axiosInstance.put("/update_cartitem_quantity/", {
                item_id: itemId,
                quantity: newQuantity,
            });
            // Re-fetch cart to get updated totals from backend
            await fetchCart();
        } catch (err) {
            const msg = getErrorMessage(err, "Failed to update quantity.");
            showToast(msg, "error");
        } finally {
            setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
        }
    };

    const handleRemoveItem = async (itemId, productName) => {
        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
        try {
            await axiosInstance.delete(`/remove_from_cart/${itemId}/`);
            showToast(`Removed "${productName}" from cart.`, "success");
            await fetchCart();
        } catch (err) {
            const msg = getErrorMessage(err, "Failed to remove item.");
            showToast(msg, "error");
        } finally {
            setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="page-container">
                <h1 className="page-title">Shopping Cart</h1>
                <LoadingSpinner message="Loading your shopping cart..." />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="page-container">
                <h1 className="page-title">Shopping Cart</h1>
                <ErrorMessage message={error} onRetry={fetchCart} />
            </div>
        );
    }

    // Empty cart state
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="page-container">
                <h1 className="page-title">Shopping Cart</h1>
                <EmptyState
                    icon="🛒"
                    title="Your cart is empty"
                    description="Looks like you haven't added anything to your cart yet. Browse our collection and find something you love!"
                    actionText="Browse Products →"
                    actionTo="/products"
                />
            </div>
        );
    }

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div
                    className={`toast-banner alert-${
                        toast.type === "error" ? "danger" : "success"
                    }`}
                >
                    <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            <h1 className="page-title" style={{ marginBottom: "1.5rem" }}>
                Shopping Cart
            </h1>

            <div className="cart-layout">
                {/* Cart Items List */}
                <div className="cart-items-list">
                    {cart.items.map((item) => {
                        const product = item.product;
                        const isUpdating = updatingItems[item.id];

                        return (
                            <div
                                key={item.id}
                                className="cart-item-row"
                                style={{
                                    opacity: isUpdating ? 0.6 : 1,
                                    pointerEvents: isUpdating
                                        ? "none"
                                        : "auto",
                                }}
                            >
                                {/* Product Image */}
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="cart-item-img"
                                    />
                                ) : (
                                    <div className="cart-item-img-placeholder">
                                        📦
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="cart-item-details">
                                    <div className="cart-item-name">
                                        <Link
                                            to={`/products/${product.slug}`}
                                        >
                                            {product.name}
                                        </Link>
                                    </div>
                                    <div className="cart-item-unit-price">
                                        {formatPrice(product.price)} each
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="cart-item-qty">
                                    <button
                                        className="qty-btn"
                                        onClick={() =>
                                            handleUpdateQuantity(
                                                item.id,
                                                item.quantity - 1
                                            )
                                        }
                                        disabled={
                                            item.quantity <= 1 || isUpdating
                                        }
                                    >
                                        −
                                    </button>
                                    <span className="qty-value">
                                        {item.quantity}
                                    </span>
                                    <button
                                        className="qty-btn"
                                        onClick={() =>
                                            handleUpdateQuantity(
                                                item.id,
                                                item.quantity + 1
                                            )
                                        }
                                        disabled={
                                            item.quantity >= product.stock ||
                                            isUpdating
                                        }
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Subtotal */}
                                <div className="cart-item-subtotal">
                                    {formatPrice(item.sub_total)}
                                </div>

                                {/* Remove Button */}
                                <button
                                    className="btn-remove"
                                    onClick={() =>
                                        handleRemoveItem(
                                            item.id,
                                            product.name
                                        )
                                    }
                                    title="Remove from cart"
                                    disabled={isUpdating}
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                    <h2>Order Summary</h2>

                    <div className="summary-row">
                        <span className="label">Items</span>
                        <span className="value">
                            {cart.total_quantity}
                        </span>
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

                    <Link to="/checkout" className="btn-checkout">
                        Proceed to Checkout
                    </Link>

                    <Link to="/products" className="btn-continue-shopping">
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Cart;