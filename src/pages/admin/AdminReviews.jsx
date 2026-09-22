import React, { useEffect, useState } from "react";
import { getReviews, deleteReview } from "../../services/adminApi";

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const loadReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getReviews({ page_size: 500 });
            setReviews(res.data.results ?? res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load customer reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleDelete = async (r) => {
        if (!window.confirm("Are you sure you want to delete this customer review?")) return;
        try {
            await deleteReview(r.id);
            loadReviews();
        } catch (err) {
            console.error(err);
            alert("Failed to delete review");
        }
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const filteredReviews = reviews.filter((r) => {
        const query = searchTerm.toLowerCase();
        const userName = (r.user?.username || r.user?.email || "").toLowerCase();
        const productName = (r.product?.name || r.product?.title || "").toLowerCase();
        const reviewText = (r.review || r.text || "").toLowerCase();
        return userName.includes(query) || productName.includes(query) || reviewText.includes(query);
    });

    if (loading && reviews.length === 0) return <div className="admin-loading">Loading customer reviews...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>Review Moderation</h2>
                    <p className="admin-subtitle">Inspect customer reviews and moderate feedback</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <input
                        type="text"
                        placeholder="Search by product, customer, or content..."
                        className="admin-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="admin-count-badge">{filteredReviews.length} reviews</span>
                </div>

                {filteredReviews.length === 0 ? (
                    <div className="admin-empty-state">No customer reviews found matching your search.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Review Comment</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map((r) => (
                                    <tr key={r.id}>
                                        <td>#{r.id}</td>
                                        <td>
                                            <div className="admin-item-title">
                                                {r.product?.name || r.product?.title || "Product"}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="admin-item-title">{r.user?.username || "User"}</div>
                                                <div className="admin-item-sub">{r.user?.email || "-"}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="star-rating" title={`${r.rating} / 5`}>
                                                {renderStars(r.rating)}
                                            </span>
                                        </td>
                                        <td className="review-comment-cell">
                                            <p className="review-comment-text">{r.review || r.text}</p>
                                        </td>
                                        <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}</td>
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
