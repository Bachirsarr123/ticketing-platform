import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/api";

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "organizer",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError("Tous les champs sont obligatoires");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Register - Force role to 'organizer'
            await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'organizer', // ✅ Toujours 'organizer'
            });

            // Auto-login after registration
            const loginResponse = await authAPI.login({
                email: formData.email,
                password: formData.password,
            });

            const { token, user: userData } = loginResponse.data;

            // ✅ Validation des données reçues
            if (!token || !userData || !userData.role) {
                setError("Erreur d'inscription : données invalides");
                return;
            }

            // ✅ Tentative de connexion
            const success = login(userData, token);

            if (!success) {
                setError("Erreur d'inscription : rôle invalide");
                return;
            }

            // Redirect to dashboard (always organizer after registration)
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Erreur inscription:", err);
            setError(
                err.response?.data?.message || "Erreur lors de l'inscription"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container-sm animate-fadeIn"
            style={{
                padding: "3rem 1.5rem",
                minHeight: "calc(100vh - 80px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "550px",
                    padding: "2.5rem",
                }}
            >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
                    <h2
                        style={{
                            background: "var(--primary-gradient)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Créer un Compte
                    </h2>
                    <p className="text-muted" style={{ marginBottom: 0 }}>
                        Devenez organisateur et créez vos événements
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error animate-fadeIn">
                        <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="name">Nom complet</label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "1.25rem",
                                }}
                            >
                                👤
                            </span>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Jean Dupont"
                                required
                                style={{ paddingLeft: "3rem" }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="email">Email</label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "1.25rem",
                                }}
                            >
                                📧
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="jean@example.com"
                                required
                                style={{ paddingLeft: "3rem" }}
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="role">Type de compte</label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "1.25rem",
                                    zIndex: 1,
                                }}
                            >
                                🎭
                            </span>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: "3rem" }}
                            >
                                <option value="organizer">Organisateur</option>
                               
                            </select>
                        </div>
                        <p
                            className="text-muted"
                            style={{ fontSize: "0.875rem", marginTop: "0.5rem", marginBottom: 0 }}
                        >
                            {formData.role === "organizer"
                                ? "📊 Créez et gérez vos événements"
                                : "⚙️ Accès complet à la plateforme"}
                        </p>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="password">Mot de passe</label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "1.25rem",
                                }}
                            >
                                🔒
                            </span>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                style={{ paddingLeft: "3rem" }}
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: "2rem" }}>
                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "1.25rem",
                                }}
                            >
                                🔑
                            </span>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                style={{ paddingLeft: "3rem" }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1.125rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        {loading ? (
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    className="spinner"
                                    style={{ width: "20px", height: "20px", borderWidth: "2px" }}
                                ></div>
                                <span>Création du compte...</span>
                            </span>
                        ) : (
                            <>🚀 Créer mon compte</>
                        )}
                    </button>

                    {/* Divider */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                backgroundColor: "var(--gray-300)",
                            }}
                        ></div>
                        <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                            OU
                        </span>
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                backgroundColor: "var(--gray-300)",
                            }}
                        ></div>
                    </div>

                    {/* Links */}
                    <div style={{ textAlign: "center" }}>
                        <p className="text-muted" style={{ marginBottom: "0.75rem" }}>
                            Vous avez déjà un compte ?
                        </p>
                        <Link
                            to="/login"
                            className="btn-outline"
                            style={{
                                width: "100%",
                                textDecoration: "none",
                                display: "inline-block",
                                padding: "0.875rem",
                            }}
                        >
                            🔑 Se connecter
                        </Link>
                    </div>

                    <div
                        style={{
                            marginTop: "1.5rem",
                            padding: "1rem",
                            backgroundColor: "var(--gray-50)",
                            borderRadius: "var(--radius-md)",
                            textAlign: "center",
                        }}
                    >
                        <Link
                            to="/"
                            className="text-primary"
                            style={{
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <span>←</span>
                            <span>Retour aux événements</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
