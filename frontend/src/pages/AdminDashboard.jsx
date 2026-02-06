import { useState, useEffect } from "react";
import { adminAPI } from "../api/api";

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("organizers");
    const [organizers, setOrganizers] = useState([]);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Charger les données selon l'onglet actif
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "organizers") {
                const response = await adminAPI.getAllOrganizers();
                setOrganizers(response.data);
            } else if (activeTab === "events") {
                const response = await adminAPI.getAllEvents();
                setEvents(response.data);
            } else if (activeTab === "stats") {
                const response = await adminAPI.getSalesStats();
                setStats(response.data);
            }
        } catch (err) {
            console.error("❌ Erreur chargement données:", err);
        } finally {
            setLoading(false);
        }
    };

    // Toggle statut organisateur
    const handleToggleOrganizer = async (id) => {
        try {
            await adminAPI.toggleOrganizer(id);
            loadData();
        } catch (err) {
            console.error("❌ Erreur toggle organisateur:", err);
            alert(err.response?.data?.message || "Erreur");
        }
    };

    // Supprimer organisateur
    const handleDeleteOrganizer = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet organisateur ?")) return;

        try {
            await adminAPI.deleteOrganizer(id);
            loadData();
        } catch (err) {
            console.error("❌ Erreur suppression organisateur:", err);
            alert(err.response?.data?.message || "Erreur");
        }
    };

    // Toggle publication événement
    const handleToggleEvent = async (id) => {
        try {
            await adminAPI.toggleEventPublish(id);
            loadData();
        } catch (err) {
            console.error("❌ Erreur toggle événement:", err);
            alert(err.response?.data?.message || "Erreur");
        }
    };

    // Supprimer événement
    const handleDeleteEvent = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

        try {
            await adminAPI.deleteEvent(id);
            loadData();
        } catch (err) {
            console.error("❌ Erreur suppression événement:", err);
            alert(err.response?.data?.message || "Erreur");
        }
    };

    return (
        <div className="container animate-fadeIn" style={{ padding: "2rem 1.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--gray-900)", marginBottom: "0.5rem" }}>
                    🔐 Dashboard Administrateur
                </h1>
                <p style={{ color: "var(--gray-600)" }}>
                    Gestion complète de la plateforme
                </p>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: "2px solid var(--gray-200)", marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => setActiveTab("organizers")}
                        className={activeTab === "organizers" ? "tab-active" : "tab"}
                        style={{
                            padding: "1rem 1.5rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            borderBottom: activeTab === "organizers" ? "3px solid var(--primary-500)" : "none",
                            color: activeTab === "organizers" ? "var(--primary-500)" : "var(--gray-600)",
                        }}
                    >
                        👥 Organisateurs
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={activeTab === "events" ? "tab-active" : "tab"}
                        style={{
                            padding: "1rem 1.5rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            borderBottom: activeTab === "events" ? "3px solid var(--primary-500)" : "none",
                            color: activeTab === "events" ? "var(--primary-500)" : "var(--gray-600)",
                        }}
                    >
                        🎤 Événements
                    </button>
                    <button
                        onClick={() => setActiveTab("stats")}
                        className={activeTab === "stats" ? "tab-active" : "tab"}
                        style={{
                            padding: "1rem 1.5rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            borderBottom: activeTab === "stats" ? "3px solid var(--primary-500)" : "none",
                            color: activeTab === "stats" ? "var(--primary-500)" : "var(--gray-600)",
                        }}
                    >
                        📊 Statistiques
                    </button>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-500)" }}>
                    Chargement...
                </div>
            )}

            {/* Onglet Organisateurs */}
            {!loading && activeTab === "organizers" && (
                <div className="card">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
                        👥 Gestion des Organisateurs ({organizers.length})
                    </h2>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                                <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Nom</th>
                                <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Email</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Statut</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Événements</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Billets Vendus</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Revenus</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizers.map((org) => (
                                <tr key={org.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <strong>{org.name}</strong>
                                    </td>
                                    <td style={{ padding: "1rem", color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                        {org.email}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {org.is_active ? (
                                            <span className="badge badge-success">✅ Actif</span>
                                        ) : (
                                            <span className="badge badge-danger">❌ Inactif</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>
                                        {org.total_events}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>
                                        {org.total_tickets_sold}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--secondary-600)" }}>
                                        {parseFloat(org.total_revenue).toFixed(2)} FCFA
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                            <button
                                                onClick={() => handleToggleOrganizer(org.id)}
                                                className="btn btn-sm"
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    fontSize: "0.875rem",
                                                    background: org.is_active ? "var(--warning-500)" : "var(--success-500)",
                                                }}
                                            >
                                                {org.is_active ? "Désactiver" : "Activer"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrganizer(org.id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {organizers.length === 0 && (
                        <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-500)" }}>
                            Aucun organisateur trouvé
                        </div>
                    )}
                </div>
            )}

            {/* Onglet Événements */}
            {!loading && activeTab === "events" && (
                <div className="card">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
                        🎤 Gestion des Événements ({events.length})
                    </h2>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                                <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Titre</th>
                                <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Organisateur</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Date</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Statut</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Billets Vendus</th>
                                <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <strong>{event.title}</strong>
                                        <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                                            📍 {event.location}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem", color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                        {event.organizer_name}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
                                        {new Date(event.date_event).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {event.is_published ? (
                                            <span className="badge badge-success">✅ Publié</span>
                                        ) : (
                                            <span className="badge badge-warning">⏳ Brouillon</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>
                                        {event.tickets_sold}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                            <button
                                                onClick={() => handleToggleEvent(event.id)}
                                                className="btn btn-sm"
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    fontSize: "0.875rem",
                                                    background: event.is_published ? "var(--warning-500)" : "var(--success-500)",
                                                }}
                                            >
                                                {event.is_published ? "Dépublier" : "Publier"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {events.length === 0 && (
                        <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-500)" }}>
                            Aucun événement trouvé
                        </div>
                    )}
                </div>
            )}

            {/* Onglet Statistiques */}
            {!loading && activeTab === "stats" && stats && (
                <div>
                    {/* Cartes de statistiques globales */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                        <div className="card" style={{ background: "linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)", color: "white" }}>
                            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Total Organisateurs</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{stats.global.total_organizers}</div>
                        </div>
                        <div className="card" style={{ background: "linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%)", color: "white" }}>
                            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Total Événements</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{stats.global.total_events}</div>
                        </div>
                        <div className="card" style={{ background: "linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)", color: "white" }}>
                            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Billets Vendus</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{stats.global.total_tickets_sold}</div>
                        </div>
                        <div className="card" style={{ background: "linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)", color: "white" }}>
                            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Revenus Totaux</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{parseFloat(stats.global.total_revenue).toFixed(0)} FCFA</div>
                        </div>
                    </div>

                    {/* Top Organisateurs */}
                    <div className="card" style={{ marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
                            🏆 Top Organisateurs
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                                    <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Nom</th>
                                    <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Billets Vendus</th>
                                    <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Revenus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topOrganizers.map((org, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                                        <td style={{ padding: "1rem" }}>
                                            <strong>{org.name}</strong>
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>
                                            {org.tickets_sold}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--secondary-600)" }}>
                                            {parseFloat(org.revenue).toFixed(2)} FCFA
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Top Événements */}
                    <div className="card">
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
                            🎉 Top Événements
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                                    <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Événement</th>
                                    <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Organisateur</th>
                                    <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Billets Vendus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topEvents.map((event, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                                        <td style={{ padding: "1rem" }}>
                                            <strong>{event.title}</strong>
                                        </td>
                                        <td style={{ padding: "1rem", color: "var(--gray-600)", fontSize: "0.875rem" }}>
                                            {event.organizer_name}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>
                                            {event.tickets_sold}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
