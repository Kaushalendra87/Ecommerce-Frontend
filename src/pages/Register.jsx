import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../services/axios";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors) setErrors(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);

        // Basic client-side validation
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: ["Passwords do not match."] });
            return;
        }

        if (formData.password.length < 8) {
            setErrors({ password: ["Password must be at least 8 characters."] });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                password: formData.password,
            };

            await axiosInstance.post("/register/", payload);

            // Redirect to login page with a success message state
            navigate("/login", {
                state: { message: "Account created successfully! Please log in below." },
            });
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response && err.response.data) {
                if (typeof err.response.data === "object") {
                    setErrors(err.response.data);
                } else {
                    setErrors({ general: [String(err.response.data)] });
                }
            } else {
                setErrors({ general: ["Network error or server unreachable. Please try again."] });
            }
        } finally {
            setLoading(false);
        }
    };

    const renderErrors = () => {
        if (!errors) return null;

        const errorMessages = [];

        Object.entries(errors).forEach(([field, msgs]) => {
            const formattedFieldName = field
                .replace("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            
            const msgList = Array.isArray(msgs) ? msgs : [msgs];
            msgList.forEach((msg) => {
                errorMessages.push(
                    field === "general" || field === "detail"
                        ? msg
                        : `${formattedFieldName}: ${msg}`
                );
            });
        });

        return (
            <div className="alert alert-danger" role="alert">
                <strong>Please fix the following:</strong>
                <ul className="alert-list">
                    {errorMessages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us today to start shopping online</p>
                </div>

                {renderErrors()}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input
                                id="first_name"
                                type="text"
                                name="first_name"
                                className="form-input"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                id="last_name"
                                type="text"
                                name="last_name"
                                className="form-input"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="At least 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;