import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scanAPI } from "../api/api";

function Scan() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  const scanTicket = async () => {
    if (!token) {
      setResult("Jeton manquant");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setResult("");
    setSuccess(false);
    setTicketData(null);

    try {
      const response = await scanAPI.scanTicket(token);

      setResult("✅ Ticket valide — accès autorisé");
      setSuccess(true);
      setTicketData(response.data.ticket);

      console.log("Ticket data:", response.data);

      // Clear input after successful scan
      setTimeout(() => {
        setToken("");
        setResult("");
        setSuccess(false);
        setTicketData(null);
      }, 5000);
    } catch (err) {
      console.error("❌ Erreur scan:", err);
      setResult(
        err.response?.data?.message || "Erreur lors du scan"
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      scanTicket();
    }
  };

  return (
    <div className="container-sm animate-fadeIn" style={{ padding: "2rem 1.5rem", maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎫 Scanner un Billet</h1>
        <p style={{ color: "var(--gray-600)" }}>
          Validez l'entrée des participants à vos événements
        </p>
      </div>

      {/* Camera Scanner Button - PROMINENT */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/scan-camera')}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '24px 48px',
            borderRadius: '12px',
            fontSize: '22px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
          }}
        >
          <span style={{ fontSize: '32px' }}>📱</span>
          Scanner avec la Caméra
        </button>
        <p style={{ color: '#10b981', fontSize: '14px', marginTop: '12px', fontWeight: '500' }}>
          ⚡ Recommandé : Scan rapide et automatique avec votre caméra
        </p>
      </div>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '2rem 0',
        gap: '1rem'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>OU</span>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
      </div>

      {/* Manual Scan Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
          ⌨️ Saisie Manuelle du Code
        </h3>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="token" style={{ display: "block", marginBottom: "0.5rem" }}>
            Code du billet
          </label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Collez le code QR ici..."
            style={{
              width: "100%",
              padding: "0.875rem",
              fontSize: "1rem",
              border: "2px solid var(--gray-300)",
              borderRadius: "var(--radius-md)",
            }}
            autoFocus
          />
          <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginTop: "0.5rem" }}>
            💡 Astuce : Collez directement le code du billet
          </p>
        </div>

        <button
          onClick={scanTicket}
          disabled={loading || !token}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "0.875rem",
            fontSize: "1.125rem",
            opacity: loading || !token ? 0.5 : 1,
          }}
        >
          {loading ? "⏳ Validation..." : "✅ Valider le Billet"}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div
          className={`alert ${success ? "alert-success" : "alert-error"} animate-fadeIn`}
          style={{ marginBottom: "2rem" }}
        >
          <span style={{ fontSize: "1.5rem" }}>{success ? "✅" : "❌"}</span>
          <div>
            <strong>{result}</strong>
            {ticketData && (
              <div style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
                <div><strong>Client:</strong> {ticketData.buyer_name}</div>
                <div><strong>Téléphone:</strong> {ticketData.buyer_phone}</div>
                <div><strong>Type:</strong> {ticketData.ticket_type_name}</div>
                <div><strong>Événement:</strong> {ticketData.event_title}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="btn-secondary"
        style={{ width: "100%", marginTop: "1rem" }}
      >
        ← Retour au Dashboard
      </button>
    </div>
  );
}

export default Scan;
