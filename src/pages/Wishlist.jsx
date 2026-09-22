import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const formatPrice = (price) => {
        return `Rs. ${parseFloat(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get("/wishlist/");
            setWishlistItems(res.data);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load your wishlist. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (productId, productName) => {
        setActionLoading((prev) => ({ ...prev, [`remove-${productId}`]: true }));
        try {
            await axiosInstance.post("/toggle_wishlist/", {
                product_id: productId,
            });
            showToast(`Removed "${productName}" from wishlist.`, "success");
            // Remove item from local state for instant feedback
            setWishlistItems((prev) =>
                prev.filter((item) => item.product.id !== productId)
            );
        } catch (err) {
            showToast(getErrorMessage(err, "Failed to remove item from wishlist."), "error");
        } finally {
            setActionLoading((prev) => ({
                ...prev,
                [`remove-${productId}`]: false,
            }));
        }
    };

    const handleAddToCart = async (product) => {
        setActionLoading((prev) => ({
            ...prev,
            [`cart-${product.id}`]: true,
        }));
        try {
            await axiosInstance.post("/add_to_cart/", {
                product_id: product.id,
                quantity: 1,
            });
            showToast(`Added "${product.name}" to cart!`, "success");
        } catch (err) {
            const msg = getErrorMessage(err, "Failed to add to cart.");
            showToast(msg, "error");
        } finally {
            setActionLoading((prev) => ({
                ...prev,
                [`cart-${product.id}`]: false,
            }));
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="page-container">
                <h1 className="page-title">My Wishlist</h1>
                <LoadingSpinner message="Loading your saved items..." />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="page-container">
                <h1 className="page-title">My Wishlist</h1>
                <ErrorMessage message={error} onRetry={fetchWishlist} />
            </div>
        );
    }

    // Empty wishlist state
    if (wishlistItems.length === 0) {
        return (
            <div className="page-container">
                <h1 className="page-title">My Wishlist</h1>
                <EmptyState
                    icon="💚"
                    title="Your wishlist is empty"
                    description="Save items you love to your wishlist. Browse our collection and tap the heart icon to save products for later!"
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

            <div className="page-header">
                <div>
                    <h1 className="page-title">My Wishlist</h1>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                            marginTop: "0.2rem",
                        }}
                    >
                        {wishlistItems.length} item
                        {wishlistItems.length !== 1 ? "s" : ""} saved
                    </p>
                </div>
            </div>

            <div className="wishlist-grid">
                {wishlistItems.map((item) => {
                    const product = item.product;
                    const inStock = product.stock > 0;
                    const isRemoving =
                        actionLoading[`remove-${product.id}`];
                    const isAddingToCart =
                        actionLoading[`cart-${product.id}`];

                    return (
                        <div key={item.id} className="wishlist-card">
                            {/* Product Image */}
                            <div className="wishlist-img-wrapper">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="wishlist-img"
                                    />
                                ) : (
                                    <div className="img-placeholder">
                                        <span style={{ fontSize: "2.5rem" }}>
                                            📦
                                        </span>
                                        <span>No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="wishlist-content">
                                {product.category && (
                                    <span className="category-tag">
                                        {product.category.name}
                                    </span>
                                )}

                                <div className="wishlist-name">
                                    <Link to={`/products/${product.slug}`}>
                                        {product.name}
                                    </Link>
                                </div>

                                <div className="wishlist-meta">
                                    <span className="wishlist-price">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span
                                        className={`stock-badge ${
                                            inStock
                                                ? "in-stock"
                                                : "out-of-stock"
                                        }`}
                                    >
                                        {inStock
                                            ? `${product.stock} in stock`
                                            : "Out of stock"}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="wishlist-actions">
                                <button
                                    className="btn-wishlist-cart"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={!inStock || isAddingToCart}
                                >
                                    {isAddingToCart
                                        ? "Adding..."
                                        : inStock
                                        ? "Add to Cart"
                                        : "Out of Stock"}
                                </button>
                                <button
                                    className="btn-wishlist-remove"
                                    onClick={() =>
                                        handleRemoveFromWishlist(
                                            product.id,
                                            product.name
                                        )
                                    }
                                    disabled={isRemoving}
                                >
                                    {isRemoving ? "..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Wishlist;