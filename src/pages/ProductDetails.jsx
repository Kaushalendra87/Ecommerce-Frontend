import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import { useAuth } from "../context/AuthContext";
import ReviewSection from "../components/ReviewSection";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/errorHandler";

function ProductDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);

    // Toast alert state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    const fetchProductDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get(`/products/${slug}/`);
            setProduct(res.data);
        } catch (err) {
            console.error("Error fetching product detail:", err);
            if (err.response?.status === 404) {
                setError("Product not found. It may have been removed or renamed.");
            } else {
                setError(getErrorMessage(err, "Failed to load product details."));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchProductDetail();
        }
    }, [slug]);

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (product && next > product.stock) return product.stock;
            return next;
        });
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            showToast("Please log in to add items to cart.", "error");
            navigate("/login");
            return;
        }

        if (!product || product.stock < 1) return;

        setAdding(true);
        try {
            await axiosInstance.post("/add_to_cart/", {
                product_id: product.id,
                quantity: quantity,
            });
            showToast(`Added ${quantity} x "${product.name}" to your cart!`, "success");
        } catch (err) {
            console.error("Add to cart error:", err);
            const msg = getErrorMessage(err, "Failed to add to cart.");
            showToast(msg, "error");
        } finally {
            setAdding(false);
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            showToast("Please log in to manage your wishlist.", "error");
            navigate("/login");
            return;
        }

        if (!product) return;

        try {
            const res = await axiosInstance.post("/toggle_wishlist/", {
                product_id: product.id,
            });
            const msg = res.data.message || "Wishlist updated!";
            showToast(msg, "success");
        } catch (err) {
            console.error("Wishlist error:", err);
            showToast(getErrorMessage(err, "Failed to update wishlist."), "error");
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <LoadingSpinner message="Loading product details..." />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="page-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <ErrorMessage message={error || "Product unavailable."} onRetry={fetchProductDetail} />
                <Link to="/products" className="btn-primary" style={{ display: "inline-block", width: "auto", marginTop: "1rem" }}>
                    ← Return to Products
                </Link>
            </div>
        );
    }

    const inStock = product.stock > 0;

    return (
        <div>
            {/* Toast Banner */}
            {toast && (
                <div className={`toast-banner alert-${toast.type === "error" ? "danger" : "success"}`}>
                    <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Breadcrumb / Navigation link */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Link to="/products" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "500" }}>
                    ← Back to All Products
                </Link>
            </div>

            <div className="page-container">
                <div className="product-detail-layout">
                    {/* Left Column: Image Card */}
                    <div className="detail-img-card">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="detail-img"
                            />
                        ) : (
                            <div className="img-placeholder" style={{ padding: "3rem" }}>
                                <span style={{ fontSize: "3rem" }}>📦</span>
                                <span>No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="detail-info">
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            {product.category && (
                                <span className="category-tag">
                                    {product.category.name}
                                </span>
                            )}
                            <span className={`stock-badge ${inStock ? "in-stock" : "out-of-stock"}`}>
                                {inStock ? `${product.stock} items in stock` : "Out of stock"}
                            </span>
                        </div>

                        <h1 className="detail-title">{product.name}</h1>

                        <div className="detail-price">
                            NRs. {parseFloat(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>

                        {product.description && (
                            <div className="detail-description">
                                <h3 style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                                    Product Description
                                </h3>
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {inStock && (
                            <div className="form-group" style={{ marginTop: "0.5rem" }}>
                                <label>Quantity:</label>
                                <div className="quantity-control">
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="qty-value">{quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="detail-actions">
                            <button
                                className="btn-primary"
                                style={{ flex: 2, padding: "0.85rem" }}
                                disabled={!inStock || adding}
                                onClick={handleAddToCart}
                            >
                                {adding ? "Adding to Cart..." : inStock ? "Add to Cart" : "Out of Stock"}
                            </button>

                            <button
                                className="btn-view-details"
                                style={{ flex: 1, padding: "0.85rem" }}
                                onClick={handleToggleWishlist}
                            >
                                ❤️ Wishlist
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product Reviews */}
                <ReviewSection productId={product.id} />
            </div>
        </div>
    );
}

export default ProductDetails;