import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/api";

function Login() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

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
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email et mot de passe obligatoires");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      const { token, user: userData } = response.data;

      // ✅ Validation des données reçues
      if (!token || !userData || !userData.role) {
        setError("Erreur de connexion : données invalides");
        return;
      }

      // ✅ Tentative de connexion
      const success = login(userData, token);

      if (!success) {
        setError("Erreur de connexion : rôle invalide");
        return;
      }

      // ✅ Redirection selon le rôle
      if (userData.role === 'admin') {
        navigate("/admin");
      } else if (userData.role === 'organizer') {
        navigate("/dashboard");
      } else {
        setError("Rôle utilisateur non reconnu");
        logout();
      }
    } catch (err) {
      console.error("❌ Erreur connexion:", err);
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect"
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
          maxWidth: "500px",
          padding: "2.5rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            🎟️
          </div>
          <h2
            style={{
              background: "var(--primary-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
            }}
          >
            Connexion Organisateur
          </h2>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Connectez-vous pour gérer vos événements
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error animate-fadeIn">
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
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
                placeholder="votre@email.com"
                required
                style={{
                  paddingLeft: "3rem",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
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
                style={{
                  paddingLeft: "3rem",
                }}
              />
            </div>
          </div>

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
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
                <span>Connexion...</span>
              </span>
            ) : (
              <>🚀 Se connecter</>
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
              Pas encore de compte ?
            </p>
            <Link
              to="/register"
              className="btn-outline"
              style={{
                width: "100%",
                textDecoration: "none",
                display: "inline-block",
                padding: "0.875rem",
              }}
            >
              ✨ Créer un compte organisateur
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

export default Login;
