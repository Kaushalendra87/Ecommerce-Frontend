import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/axios";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import EmptyState from "./EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function ReviewSection({ productId }) {
    const { isAuthenticated, user: authUser } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add Review Form State
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Edit Review State
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editHoverRating, setEditHoverRating] = useState(0);
    const [editComment, setEditComment] = useState("");
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    // Fetch reviews on mount or when productId changes
    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get(`/products/${productId}/reviews/`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(getErrorMessage(err, "Failed to load reviews. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    // Check if current user has already reviewed the product
    const userReview = authUser ? reviews.find((r) => r.user?.id === authUser.id) : null;

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            await axiosInstance.post("/add_review/", {
                product_id: productId,
                rating: rating,
                review: comment.trim(),
            });
            setComment("");
            setRating(5);
            // Refresh reviews
            await fetchReviews();
        } catch (err) {
            console.error("Add review error:", err);
            const msg = getErrorMessage(err, "Failed to submit review.");
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (review) => {
        setEditingReviewId(review.id);
        setEditRating(review.rating);
        setEditComment(review.review);
        setUpdateError(null);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setUpdateError(null);
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateError(null);

        try {
            await axiosInstance.put(`/update_review/${editingReviewId}/`, {
                rating: editRating,
                review: editComment.trim(),
            });
            setEditingReviewId(null);
            await fetchReviews();
        } catch (err) {
            console.error("Update review error:", err);
            const msg = getErrorMessage(err, "Failed to update review.");
            setUpdateError(msg);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete your review?")) {
            return;
        }

        try {
            await axiosInstance.delete(`/delete_review/${reviewId}/`);
            await fetchReviews();
        } catch (err) {
            console.error("Delete review error:", err);
            alert(getErrorMessage(err, "Failed to delete review."));
        }
    };

    const renderStars = (count, interactive = false, value = 0, onHover = () => {}, onClick = () => {}, hoverVal = 0) => {
        const stars = [];
        const currentVal = hoverVal || value || count;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star-icon ${i <= currentVal ? "filled" : ""} ${interactive ? "interactive" : ""}`}
                    onMouseEnter={interactive ? () => onHover(i) : undefined}
                    onMouseLeave={interactive ? () => onHover(0) : undefined}
                    onClick={interactive ? () => onClick(i) : undefined}
                    style={{ cursor: interactive ? "pointer" : "default", fontSize: interactive ? "1.6rem" : "1.1rem" }}
                >
                    ★
                </span>
            );
        }
        return <div className="stars-wrapper">{stars}</div>;
    };

    // Calculate Summary Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getReviewerInitials = (userObj) => {
        if (!userObj) return "U";
        if (userObj.first_name && userObj.last_name) {
            return `${userObj.first_name[0]}${userObj.last_name[0]}`.toUpperCase();
        }
        if (userObj.first_name) return userObj.first_name[0].toUpperCase();
        return "U";
    };

    return (
        <div className="reviews-section" style={{ marginTop: "3rem" }}>
            <h2 className="reviews-section-title">Customer Reviews</h2>

            {/* Summary Rating Banner */}
            <div className="reviews-summary-card">
                <div className="summary-score-box">
                    <span className="summary-avg">{avgRating}</span>
                    <span className="summary-scale">out of 5</span>
                </div>
                <div className="summary-details">
                    {renderStars(Math.round(parseFloat(avgRating)))}
                    <span className="summary-count">Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
                </div>
            </div>

            <div className="reviews-layout">
                {/* Reviews List */}
                <div className="reviews-list-container">
                    <h3 className="sub-title">Reviews ({totalReviews})</h3>
                    {loading ? (
                        <LoadingSpinner message="Loading customer reviews..." size="small" />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={fetchReviews} />
                    ) : reviews.length === 0 ? (
                        <EmptyState
                            icon="💬"
                            title="No reviews yet"
                            description="Be the first customer to share your thoughts and review this product!"
                        />
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((rev) => {
                                const isEditingThis = editingReviewId === rev.id;
                                const isOwnReview = authUser && rev.user?.id === authUser.id;

                                return (
                                    <div key={rev.id} className="review-card">
                                        <div className="review-card-header">
                                            <div className="reviewer-info">
                                                <div className="reviewer-avatar">
                                                    {rev.user?.profile_picture ? (
                                                        <img src={rev.user.profile_picture} alt="Avatar" />
                                                    ) : (
                                                        <div className="reviewer-initials">
                                                            {getReviewerInitials(rev.user)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="reviewer-name">
                                                        {rev.user?.first_name || rev.user?.last_name
                                                            ? `${rev.user.first_name || ""} ${rev.user.last_name || ""}`.trim()
                                                            : "Verified Customer"}
                                                    </h4>
                                                    <span className="review-date">{formatDate(rev.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Stars and Actions */}
                                            <div className="review-header-right">
                                                {!isEditingThis && renderStars(rev.rating)}
                                                {isOwnReview && !isEditingThis && (
                                                    <div className="review-actions">
                                                        <button
                                                            className="btn-edit-action"
                                                            onClick={() => handleStartEdit(rev)}
                                                            title="Edit Review"
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            className="btn-delete-action"
                                                            onClick={() => handleDeleteReview(rev.id)}
                                                            title="Delete Review"
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit Mode / Content */}
                                        {isEditingThis ? (
                                            <form onSubmit={handleUpdateReview} className="review-edit-form" style={{ marginTop: "1rem" }}>
                                                <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                                                    <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Your Rating:</label>
                                                    {renderStars(
                                                        0,
                                                        true,
                                                        editRating,
                                                        setEditHoverRating,
                                                        setEditRating,
                                                        editHoverRating
                                                    )}
                                                </div>
                                                <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                                                    <textarea
                                                        value={editComment}
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                        className="form-input"
                                                        rows="3"
                                                        maxLength="500"
                                                        required
                                                    />
                                                </div>
                                                {updateError && <ErrorMessage message={updateError} />}
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button
                                                        type="button"
                                                        className="btn-view-details"
                                                        style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                                                        onClick={handleCancelEdit}
                                                        disabled={updating}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn-primary"
                                                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", width: "auto" }}
                                                        disabled={updating}
                                                    >
                                                        {updating ? "Saving..." : "Save Changes"}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <p className="review-text">{rev.review}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Form to submit review */}
                <div className="review-form-container">
                    <h3 className="sub-title">Write a Review</h3>

                    {!isAuthenticated ? (
                        <div className="review-login-prompt">
                            <p>You must be logged in to post a review.</p>
                            <Link to="/login" className="btn-primary" style={{ display: "inline-block", textAlign: "center", marginTop: "0.5rem" }}>
                                Log In
                            </Link>
                        </div>
                    ) : userReview ? (
                        <div className="review-already-posted">
                            <p>🎉 You have already reviewed this product.</p>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                You can edit or delete your review directly in the list.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleAddReview} className="review-add-form">
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>Rating:</label>
                                {renderStars(
                                    0,
                                    true,
                                    rating,
                                    setHoverRating,
                                    setRating,
                                    hoverRating
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <label htmlFor="review_comment" style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                                    Your Review:
                                </label>
                                <textarea
                                    id="review_comment"
                                    placeholder="Share your experience with this product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="form-input"
                                    rows="4"
                                    maxLength="500"
                                    required
                                />
                            </div>

                            {submitError && <ErrorMessage message={submitError} />}

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting}
                                style={{ padding: "0.6rem 1.25rem" }}
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewSection;
