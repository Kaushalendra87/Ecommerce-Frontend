import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [accessToken, setAccessToken] = useState(() => {
        return localStorage.getItem("access_token");
    });

    // Keep auth state in sync with localStorage across tabs or background refreshes
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("access_token");
            const savedUser = localStorage.getItem("user");
            setAccessToken(token);
            setUser(savedUser ? JSON.parse(savedUser) : null);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const updateUser = (userData) => {
        if (userData) {
            setUser((prevUser) => {
                const merged = prevUser ? { ...prevUser, ...userData } : userData;
                localStorage.setItem("user", JSON.stringify(merged));
                return merged;
            });
        }
    };

    const login = (data) => {
        const { access, refresh, user } = data;

        localStorage.setItem("access_token", access);
        if (refresh) localStorage.setItem("refresh_token", refresh);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        setAccessToken(access);
        if (user) setUser(user);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                login,
                logout,
                updateUser,
                isAuthenticated: !!accessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}