import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
        setMobileMenuOpen(false);
    };

    const navStyles = {
        nav: {
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            position: "sticky",
            top: 0,
            zIndex: 1000,
        },
        container: {
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        logo: {
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "700",
            transition: "transform 0.2s",
        },
        logoIcon: {
            fontSize: "2rem",
        },
        desktopNav: {
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
        },
        navLink: {
            color: "rgba(255, 255, 255, 0.9)",
            textDecoration: "none",
            fontWeight: "500",
            transition: "color 0.2s",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
        },
        navLinkHover: {
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        userInfo: {
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        badge: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: "600",
        },
        button: {
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            fontSize: "0.875rem",
        },
        buttonPrimary: {
            backgroundColor: "white",
            color: "#6366f1",
        },
        buttonSecondary: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        mobileMenuButton: {
            display: "none",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.5rem",
        },
        mobileMenu: {
            display: "none",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
            backgroundColor: "rgba(99, 102, 241, 0.95)",
            borderRadius: "0.5rem",
            marginTop: "1rem",
        },
    };

    return (
        <nav style={navStyles.nav}>
            <div style={navStyles.container}>
                {/* Logo */}
                <Link
                    to="/"
                    style={navStyles.logo}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    <span style={navStyles.logoIcon}>🎟️</span>
                    <span>Ticketing</span>
                </Link>

                {/* Desktop Navigation */}
                <div
                    style={{
                        ...navStyles.desktopNav,
                        "@media (max-width: 768px)": { display: "none" },
                    }}
                    className="desktop-nav"
                >
                    <Link
                        to="/"
                        style={navStyles.navLink}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "white";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                    >
                        Événements
                    </Link>

                    {isAuthenticated() ? (
                        <>
                            <div style={navStyles.userInfo}>
                                <span>👋</span>
                                <span>{user?.name || user?.email}</span>
                                <span style={navStyles.badge}>
                                    {user?.role === "admin" ? "ADMIN" : "ORGANISATEUR"}
                                </span>
                            </div>

                            {user?.role === "admin" ? (
                                <Link
                                    to="/admin"
                                    style={{
                                        ...navStyles.button,
                                        ...navStyles.buttonPrimary,
                                        textDecoration: "none",
                                        display: "inline-block",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    🔐 Admin
                                </Link>
                            ) : (
                                <Link
                                    to="/dashboard"
                                    style={{
                                        ...navStyles.button,
                                        ...navStyles.buttonPrimary,
                                        textDecoration: "none",
                                        display: "inline-block",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    📊 Dashboard
                                </Link>
                            )}

                            <Link
                                to="/scan"
                                style={{
                                    ...navStyles.navLink,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "white";
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                📱 Scanner
                            </Link>

                            <button
                                onClick={handleLogout}
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonSecondary,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                                }}
                            >
                                🚪 Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonPrimary,
                                    textDecoration: "none",
                                    display: "inline-block",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                Connexion
                            </Link>

                            <Link
                                to="/register"
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonSecondary,
                                    textDecoration: "none",
                                    display: "inline-block",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                                }}
                            >
                                Inscription
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    style={navStyles.mobileMenuButton}
                    className="mobile-menu-button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={navStyles.mobileMenu} className="mobile-menu">
                    <Link
                        to="/"
                        style={{ ...navStyles.navLink, display: "block" }}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Événements
                    </Link>

                    {isAuthenticated() ? (
                        <>
                            <div style={{ ...navStyles.userInfo, justifyContent: "center" }}>
                                <span>👋 {user?.name || user?.email}</span>
                            </div>

                            <Link
                                to="/dashboard"
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonPrimary,
                                    textDecoration: "none",
                                    textAlign: "center",
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                📊 Dashboard
                            </Link>

                            <Link
                                to="/scan"
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonSecondary,
                                    textDecoration: "none",
                                    textAlign: "center",
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                📱 Scanner
                            </Link>

                            <button
                                onClick={handleLogout}
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonSecondary,
                                }}
                            >
                                🚪 Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonPrimary,
                                    textDecoration: "none",
                                    textAlign: "center",
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Connexion
                            </Link>

                            <Link
                                to="/register"
                                style={{
                                    ...navStyles.button,
                                    ...navStyles.buttonSecondary,
                                    textDecoration: "none",
                                    textAlign: "center",
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
      `}</style>
        </nav>
    );
}

export default Navbar;
