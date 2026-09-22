import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setSearchQuery(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            navigate(`/products?search=${encodeURIComponent(trimmed)}`);
        } else {
            navigate("/products");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getInitial = () => {
        if (user?.first_name) return user.first_name[0];
        if (user?.username) return user.username[0];
        return "E";
    };

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span>Eco</span>Shop
                </Link>

                <form className="navbar-search" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search products, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" aria-label="Search">
                        🔍
                    </button>
                </form>

                <nav className="navbar-links">
                    <Link to="/" className={`nav-link ${isActive("/")}`}>
                        Home
                    </Link>
                    <Link to="/products" className={`nav-link ${isActive("/products")}`}>
                        Shop
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {user?.is_superuser && (
                                <Link to="/admin" className={`nav-link ${isActive("/admin")}`}>
                                    Admin
                                </Link>
                            )}

                            <Link to="/wishlist" className={`nav-link ${isActive("/wishlist")}`}>
                                Wishlist
                            </Link>
                            <Link to="/cart" className={`nav-link ${isActive("/cart")}`}>
                                Cart
                            </Link>
                            <Link to="/orders" className={`nav-link ${isActive("/orders")}`}>
                                Orders
                            </Link>

                            <div className="nav-user">
                                <Link to="/profile" className="user-badge" title="View Profile">
                                    {user?.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user?.username || "Profile"}
                                            className="avatar-img-nav"
                                        />
                                    ) : (
                                        <span className="avatar-circle">{getInitial()}</span>
                                    )}
                                    <span>{user?.first_name || user?.username || "Account"}</span>
                                </Link>

                                <button onClick={handleLogout} className="btn-logout">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`nav-link ${isActive("/login")}`}>
                                Login
                            </Link>
                            <Link to="/register" className={`nav-link ${isActive("/register")}`}>
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;