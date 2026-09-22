import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/errorHandler";

function Profile() {
    const { user: authUser, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(authUser || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState(null);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get("/profile/");
            setProfile(res.data);
            if (updateUser) {
                updateUser(res.data);
            }
        } catch (err) {
            console.error("Error fetching profile details:", err);
            setError(getErrorMessage(err, "Failed to sync latest profile data from server."));
            if (authUser) {
                setProfile(authUser);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/login");
        }
    };

    const handleStartEdit = () => {
        setEditForm({
            username: profile?.username || "",
            first_name: profile?.first_name || "",
            last_name: profile?.last_name || "",
        });
        setProfilePictureFile(null);
        setImagePreview(null);
        setValidationErrors(null);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setProfilePictureFile(null);
        setImagePreview(null);
        setValidationErrors(null);
    };

    const handleInputChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value,
        });
        if (validationErrors?.[e.target.name]) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: null,
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setValidationErrors(null);
        setError(null);
        setSuccessMsg(null);

        const formData = new FormData();
        formData.append("username", editForm.username.trim());
        formData.append("first_name", editForm.first_name.trim());
        formData.append("last_name", editForm.last_name.trim());

        if (profilePictureFile) {
            formData.append("profile_picture", profilePictureFile);
        }

        try {
            const res = await axiosInstance.put("/profile/update/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setProfile(res.data);
            if (updateUser) {
                updateUser(res.data);
            }
            setSuccessMsg("Profile updated successfully!");
            setIsEditing(false);
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err) {
            console.error("Profile update error:", err);
            if (err.response?.status === 400 && typeof err.response.data === "object") {
                setValidationErrors(err.response.data);
            } else {
                setError(getErrorMessage(err, "Failed to update profile. Please try again."));
            }
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        if (!profile) return "U";
        if (profile.first_name && profile.last_name) {
            return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
        }
        if (profile.first_name) {
            return profile.first_name[0].toUpperCase();
        }
        if (profile.username) {
            return profile.username[0].toUpperCase();
        }
        return "U";
    };

    const displayName = profile?.first_name || profile?.last_name 
        ? `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()
        : profile?.username || "User";

    if (loading && !profile) {
        return (
            <div className="page-container">
                <LoadingSpinner message="Loading account profile..." />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="profile-container">
                {/* Header Banner Card */}
                <div className="profile-header-card">
                    <div className="profile-avatar-wrapper">
                        {profile?.profile_picture ? (
                            <img
                                src={profile.profile_picture}
                                alt={displayName}
                                className="profile-avatar-img"
                            />
                        ) : (
                            <div className="profile-avatar-initials">
                                {getInitials()}
                            </div>
                        )}
                    </div>

                    <div className="profile-header-info">
                        <div className="profile-badge">Account Profile</div>
                        <h1 className="profile-name">{displayName}</h1>
                        <p className="profile-email">✉️ {profile?.email || "No email available"}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-danger-outline profile-logout-btn"
                        title="Log out of your account"
                    >
                        🚪 Logout
                    </button>
                </div>

                {successMsg && (
                    <div className="alert alert-success" style={{ marginTop: "1rem" }}>
                        ✅ {successMsg}
                    </div>
                )}

                {error && <ErrorMessage message={error} onRetry={fetchProfile} />}

                {/* Main Content Layout */}
                <div className="profile-content-grid">
                    {/* Left Panel: Account Details or Edit Form */}
                    <div className="profile-card">
                        {!isEditing ? (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                                    <h2 className="profile-card-title" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
                                        👤 Account Information
                                    </h2>
                                    <button 
                                        className="btn-primary" 
                                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", width: "auto" }}
                                        onClick={handleStartEdit}
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                </div>

                                <div className="profile-info-list">
                                    <div className="profile-info-item">
                                        <span className="info-label">Username</span>
                                        <span className="info-value">{profile?.username || "N/A"}</span>
                                    </div>

                                    <div className="profile-info-item">
                                        <span className="info-label">Email Address</span>
                                        <span className="info-value">{profile?.email || "N/A"}</span>
                                    </div>

                                    <div className="profile-info-item">
                                        <span className="info-label">First Name</span>
                                        <span className="info-value">{profile?.first_name || "Not provided"}</span>
                                    </div>

                                    <div className="profile-info-item">
                                        <span className="info-label">Last Name</span>
                                        <span className="info-value">{profile?.last_name || "Not provided"}</span>
                                    </div>

                                    <div className="profile-info-item">
                                        <span className="info-label">User ID</span>
                                        <span className="info-value">#{profile?.id || "N/A"}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSaveProfile} className="profile-edit-form">
                                <h2 className="profile-card-title">
                                    ✏️ Edit Account Profile
                                </h2>

                                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                    <label>Profile Picture</label>
                                    <div className="profile-pic-picker-wrapper">
                                        <div className="profile-pic-picker-preview">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="New Preview" />
                                            ) : profile?.profile_picture ? (
                                                <img src={profile.profile_picture} alt="Current Pic" />
                                            ) : (
                                                <div className="picker-avatar-initials">{getInitials()}</div>
                                            )}
                                        </div>
                                        <div className="picker-file-input">
                                            <input 
                                                type="file" 
                                                id="profile_picture" 
                                                accept="image/*" 
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                            />
                                            <label htmlFor="profile_picture" className="btn-view-details" style={{ cursor: "pointer", display: "inline-block", fontSize: "0.85rem", padding: "0.5rem 0.85rem" }}>
                                                📸 Choose Photo
                                            </label>
                                        </div>
                                    </div>
                                    {validationErrors?.profile_picture && (
                                        <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                            {Array.isArray(validationErrors.profile_picture) ? validationErrors.profile_picture.join(", ") : validationErrors.profile_picture}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group" style={{ marginBottom: "1rem" }}>
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={editForm.username}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                    {validationErrors?.username && (
                                        <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                            {Array.isArray(validationErrors.username) ? validationErrors.username.join(", ") : validationErrors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="form-grid-2" style={{ marginBottom: "1.5rem" }}>
                                    <div className="form-group">
                                        <label htmlFor="first_name">First Name</label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            value={editForm.first_name}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                        {validationErrors?.first_name && (
                                            <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                                {Array.isArray(validationErrors.first_name) ? validationErrors.first_name.join(", ") : validationErrors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="last_name">Last Name</label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            value={editForm.last_name}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                        {validationErrors?.last_name && (
                                            <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                                {Array.isArray(validationErrors.last_name) ? validationErrors.last_name.join(", ") : validationErrors.last_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <button 
                                        type="button" 
                                        className="btn-view-details" 
                                        onClick={handleCancelEdit} 
                                        disabled={saving}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary" 
                                        disabled={saving}
                                        style={{ flex: 2 }}
                                    >
                                        {saving ? "Saving Changes..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Panel: Quick Access & Actions */}
                    <div className="profile-card">
                        <h2 className="profile-card-title">
                            ⚡ Quick Actions
                        </h2>

                        <div className="profile-quick-links">
                            <Link to="/orders" className="quick-link-card">
                                <div className="quick-link-icon">🛍️</div>
                                <div className="quick-link-text">
                                    <h3>My Orders</h3>
                                    <p>View past orders & purchase history</p>
                                </div>
                                <span className="quick-link-arrow">→</span>
                            </Link>

                            <Link to="/wishlist" className="quick-link-card">
                                <div className="quick-link-icon">❤️</div>
                                <div className="quick-link-text">
                                    <h3>My Wishlist</h3>
                                    <p>Browse saved favorite items</p>
                                </div>
                                <span className="quick-link-arrow">→</span>
                            </Link>

                            <Link to="/cart" className="quick-link-card">
                                <div className="quick-link-icon">🛒</div>
                                <div className="quick-link-text">
                                    <h3>Shopping Cart</h3>
                                    <p>Review items in your cart</p>
                                </div>
                                <span className="quick-link-arrow">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;