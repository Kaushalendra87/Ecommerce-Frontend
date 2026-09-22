import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/axios";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Intended destination after successful login
    const from = location.state?.from?.pathname || "/";
    const successMessage = location.state?.message || "";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/api/token/", {
                email: formData.email.trim(),
                password: formData.password,
            });

            // Store authentication tokens and user in context & localStorage
            login(response.data);

            // Redirect to original route or home page
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            if (err.response?.data) {
                if (err.response.data.detail) {
                    setError(err.response.data.detail);
                } else if (err.response.data.non_field_errors) {
                    setError(err.response.data.non_field_errors.join(" "));
                } else if (typeof err.response.data === "string") {
                    setError(err.response.data);
                } else {
                    setError("Invalid email or password. Please try again.");
                }
            } else {
                setError("Unable to connect to server. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your account</p>
                </div>

                {successMessage && (
                    <div className="alert alert-success" role="status">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create an Account</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;