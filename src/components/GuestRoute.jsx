import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute component
 * Wraps auth pages (Login, Register).
 * Redirects already authenticated users to the home page or intended destination.
 */
function GuestRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
}

export default GuestRoute;
