import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function Products() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toast notification state
    const [toast, setToast] = useState(null);

    // Filter states from URL search params
    const selectedCategory = searchParams.get("category") || "";
    const searchQuery = searchParams.get("search") || "";
    const selectedOrdering = searchParams.get("ordering") || "";

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get("/category/");
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products whenever filters/search change
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;
            if (selectedOrdering) params.ordering = selectedOrdering;

            const res = await axiosInstance.get("/product_list/", { params });
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(getErrorMessage(err, "Failed to load products. Please check your network connection."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchQuery, selectedOrdering]);

    const handleCategoryClick = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }
        setSearchParams(params);
    };

    const handleOrderingChange = (e) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (val) {
            params.set("ordering", val);
        } else {
            params.delete("ordering");
        }
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            showToast("Please log in to add items to cart.", "error");
            navigate("/login");
            return;
        }

        try {
            await axiosInstance.post("/add_to_cart/", {
                product_id: product.id,
                quantity: 1,
            });
            showToast(`Added "${product.name}" to cart!`, "success");
        } catch (err) {
            console.error("Add to cart error:", err);
            const msg = getErrorMessage(err, "Failed to add product to cart.");
            showToast(msg, "error");
        }
    };

    const handleToggleWishlist = async (product) => {
        if (!isAuthenticated) {
            showToast("Please log in to manage your wishlist.", "error");
            navigate("/login");
            return;
        }

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

    return (
        <div>
            {/* Toast Notification Banner */}
            {toast && (
                <div className={`toast-banner alert-${toast.type === "error" ? "danger" : "success"}`}>
                    <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                        Showing {products.length} product{products.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {(selectedCategory || searchQuery || selectedOrdering) && (
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: "0.4rem 0.85rem",
                            fontSize: "0.85rem",
                            backgroundColor: "var(--bg-subtle)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Reset All Filters
                    </button>
                )}
            </div>

            {/* Category Quick Chips */}
            <div className="category-chips">
                <button
                    className={`chip-btn ${!selectedCategory ? "active" : ""}`}
                    onClick={() => handleCategoryClick("")}
                >
                    All Categories
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`chip-btn ${selectedCategory === cat.slug ? "active" : ""}`}
                        onClick={() => handleCategoryClick(cat.slug)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="filter-bar">
                <div className="filter-group">
                    <span className="filter-label">Category:</span>
                    <select
                        className="select-input"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryClick(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <span className="filter-label">Sort by:</span>
                    <select
                        className="select-input"
                        value={selectedOrdering}
                        onChange={handleOrderingChange}
                    >
                        <option value="">Default (Featured)</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                        <option value="-name">Name: Z to A</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <LoadingSpinner message="Loading catalog products..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchProducts} />
            ) : products.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="No Products Found"
                    description="We couldn't find any products matching your current search or filter criteria."
                    actionText="Clear Search & Filters"
                    onAction={clearFilters}
                />
            ) : (
                <div className="product-grid">
                    {products.map((product) => {
                        const inStock = product.stock > 0;
                        return (
                            <div key={product.id} className="product-card">
                                <button
                                    className="wishlist-btn-corner"
                                    onClick={() => handleToggleWishlist(product)}
                                    title="Toggle Wishlist"
                                >
                                    ❤️
                                </button>

                                <div className="card-img-wrapper">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="card-img"
                                        />
                                    ) : (
                                        <div className="img-placeholder">
                                            <span style={{ fontSize: "2rem" }}>📦</span>
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-content">
                                    {product.category && (
                                        <span className="category-tag">
                                            {product.category.name}
                                        </span>
                                    )}

                                    <h2 className="card-title" title={product.name}>
                                        {product.name}
                                    </h2>

                                    <div className="card-price-row">
                                        <span className="card-price">
                                            NRs. {parseFloat(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className={`stock-badge ${inStock ? "in-stock" : "out-of-stock"}`}>
                                            {inStock ? `${product.stock} in stock` : "Out of stock"}
                                        </span>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="btn-add-cart"
                                            disabled={!inStock}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            {inStock ? "Add to Cart" : "Sold Out"}
                                        </button>
                                        <Link
                                            to={`/products/${product.slug}`}
                                            className="btn-view-details"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Products;