import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user and token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                // ✅ Validation du rôle
                if (parsedUser.role && (parsedUser.role === 'admin' || parsedUser.role === 'organizer')) {
                    setToken(storedToken);
                    setUser(parsedUser);
                } else {
                    // Rôle invalide, nettoyer le localStorage
                    console.error('❌ Rôle invalide détecté, déconnexion');
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            } catch (err) {
                console.error('❌ Erreur parsing user data:', err);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        // ✅ Validation des données avant stockage
        if (!userData || !userData.role || !authToken) {
            console.error('❌ Données de connexion invalides');
            return false;
        }

        if (userData.role !== 'admin' && userData.role !== 'organizer') {
            console.error('❌ Rôle invalide:', userData.role);
            return false;
        }

        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        return true;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const isAuthenticated = () => {
        return !!token && !!user && !!user.role;
    };

    const isOrganizer = () => {
        return user?.role === "organizer";
    };

    const isAdmin = () => {
        return user?.role === "admin";
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        isOrganizer,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;
