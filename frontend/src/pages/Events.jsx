import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventAPI, ticketTypeAPI, purchaseAPI } from "../api/api";
import { generateTicketImage } from "../utils/generateTicketImage";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  // 🔍 Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'price'

  // Load public events
  useEffect(() => {
    loadPublicEvents();
  }, []);

  const loadPublicEvents = async () => {
    try {
      const response = await eventAPI.getPublicEvents();
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading events:", err);
      setLoading(false);
    }
  };

  // Load ticket types for an event
  const loadTicketTypes = async (eventId) => {
    setLoadingTickets(true);
    try {
      const response = await ticketTypeAPI.getByEvent(eventId);
      setTicketTypes(response.data);
      setLoadingTickets(false);
    } catch (err) {
      console.error("Error loading ticket types:", err);
      setTicketTypes([]);
      setLoadingTickets(false);
    }
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
      setTicketTypes([]);
    } else {
      setSelectedEvent(event);
      setQrCode(null);
      setPurchasedTicket(null);
      loadTicketTypes(event.id);
    }
  };

  // Reserve a ticket
  const reserveTicket = async (ticketType) => {
    const buyer_name = prompt("Votre nom complet ?");
    const buyer_phone = prompt("Votre numéro de téléphone ?");
    const buyer_email = prompt("Votre email (optionnel, pour recevoir votre billet) ?");

    if (!buyer_name || !buyer_phone) {
      alert("Nom et téléphone obligatoires");
      return;
    }

    try {
      const response = await purchaseAPI.purchaseTicket(ticketType.id, {
        buyer_name,
        buyer_phone,
        buyer_email: buyer_email || undefined,
      });

      console.log("🎫 Ticket réservé:", response.data);

      setQrCode(response.data.qr);
      setPurchasedTicket(response.data.ticket);

      // Scroll to QR code
      setTimeout(() => {
        document.getElementById("qr-code-section")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      alert(err.response?.data?.message || "Erreur lors de la réservation");
    }
  };

  // 🔍 Filter and Sort Logic
  const getFilteredAndSortedEvents = () => {
    let filtered = [...events];

    // Search by title
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date_event);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(a.date_event) - new Date(b.date_event));
    } else if (sortBy === "price") {
      // Sort by minimum ticket price (we'll need to add this info)
      filtered.sort((a, b) => (a.min_price || 0) - (b.min_price || 0));
    }

    return filtered;
  };

  // Get unique locations for filter dropdown
  const getUniqueLocations = () => {
    const locations = events.map(e => e.location);
    return [...new Set(locations)].sort();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
    setDateFilter("");
    setSortBy("date");
  };

  const filteredEvents = getFilteredAndSortedEvents();

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem", color: "var(--gray-500)" }}>
          Chargement des événements...
        </p>
      </div>
    );
  }

  return (
    <div className="container animate-fadeIn" style={{ padding: "3rem 1.5rem", minHeight: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{
          background: "var(--primary-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "1rem"
        }}>
          🎉 Événements Disponibles
        </h1>
        <p className="text-muted" style={{ fontSize: "1.125rem", marginBottom: 0 }}>
          Découvrez nos événements et réservez vos billets en quelques clics
        </p>
      </div>

      {/* 🔍 Search & Filter Bar */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          {/* Search */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem", color: "var(--gray-700)" }}>
              🔍 Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom de l'événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary-500)"}
              onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"}
            />
          </div>

          {/* Location Filter */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem", color: "var(--gray-700)" }}>
              📍 Lieu
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="">Tous les lieux</option>
              {getUniqueLocations().map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem", color: "var(--gray-700)" }}>
              📅 Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                cursor: "pointer"
              }}
            />
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem", color: "var(--gray-700)" }}>
              🔄 Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="date">Date (plus proche)</option>
              <option value="price">Prix (moins cher)</option>
            </select>
          </div>
        </div>

        {/* Results & Clear Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--gray-200)" }}>
          <span style={{ color: "var(--gray-600)", fontSize: "0.875rem", fontWeight: "500" }}>
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
          </span>
          {(searchQuery || locationFilter || dateFilter || sortBy !== "date") && (
            <button
              onClick={clearFilters}
              className="btn"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                background: "var(--gray-100)",
                color: "var(--gray-700)"
              }}
            >
              ✕ Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
            {events.length === 0 ? "🎭" : "🔍"}
          </div>
          <h3 style={{ color: "var(--gray-600)", fontWeight: "500" }}>
            {events.length === 0
              ? "Aucun événement disponible pour le moment"
              : "Aucun événement ne correspond à vos critères"
            }
          </h3>
          <p className="text-muted">
            {events.length === 0
              ? "Revenez bientôt pour découvrir de nouveaux événements !"
              : "Essayez de modifier vos filtres de recherche"
            }
          </p>
          {events.length > 0 && (
            <button
              onClick={clearFilters}
              className="btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1" style={{ gap: "2rem" }}>
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="card"
              style={{
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              {/* Event Image */}
              {event.image_url && (
                <div style={{
                  width: "100%",
                  height: "300px",
                  overflow: "hidden",
                  borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                  marginBottom: "1.5rem"
                }}>
                  <img
                    src={`http://localhost:5000${event.image_url}`}
                    alt={event.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Event Header */}
              <div style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                borderRadius: "var(--radius-lg)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.75rem" }}>
                      {event.title}
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-700)" }}>
                        <span style={{ fontSize: "1.25rem" }}>📍</span>
                        <span style={{ fontWeight: "500" }}>{event.location}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-700)" }}>
                        <span style={{ fontSize: "1.25rem" }}>📅</span>
                        <span style={{ fontWeight: "500" }}>
                          {new Date(event.date_event).toLocaleString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: "0.875rem" }}>
                    ✅ DISPONIBLE
                  </span>
                </div>

                {event.description && (
                  <p style={{
                    marginTop: "1rem",
                    marginBottom: 0,
                    color: "var(--gray-600)",
                    lineHeight: "1.6"
                  }}>
                    {event.description}
                  </p>
                )}
              </div>

              {/* View Tickets Button */}
              <button
                onClick={() => navigate(`/events/${event.id}/reservation`)}
                className="btn-primary"
                style={{
                  width: "100%",
                  fontSize: "1rem",
                  padding: "1rem",
                }}
              >
                🎫 Voir les billets disponibles
              </button>


              {/* Ticket Types Section - MOVED TO DEDICATED PAGE */}
            </div>
          ))}
        </div>
      )}



      {/* QR Code Display */}
      {
        qrCode && purchasedTicket && (
          <div
            id="qr-code-section"
            className="card animate-fadeIn"
            style={{
              marginTop: "3rem",
              padding: "2rem",
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              border: "3px solid var(--secondary-500)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>

            <h2 style={{ color: "var(--secondary-600)", marginBottom: "1rem" }}>
              Votre Billet est Prêt !
            </h2>

            <div className="alert alert-success" style={{
              display: "inline-block",
              marginBottom: "1.5rem"
            }}>
              <span style={{ fontSize: "1.25rem" }}>👤</span>
              <span style={{ fontSize: "1.125rem" }}>
                Billet réservé pour <strong>{purchasedTicket.buyer_name}</strong>
              </span>
            </div>

            <div style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "var(--radius-xl)",
              display: "inline-block",
              boxShadow: "var(--shadow-xl)",
            }}>
              <img
                src={qrCode}
                alt="QR Code Ticket"
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  height: "auto",
                  border: "4px solid var(--secondary-500)",
                  borderRadius: "var(--radius-lg)",
                }}
              />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <p style={{
                color: "var(--secondary-600)",
                fontSize: "1.125rem",
                fontWeight: "600",
                marginBottom: "0.5rem"
              }}>
                📱 Présentez ce QR code à l'entrée de l'événement
              </p>
              <p className="text-muted" style={{ fontSize: "0.875rem", fontFamily: "monospace" }}>
                Token: {purchasedTicket.qr_token}
              </p>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={async () => {
                  try {
                    const QRCode = (await import("qrcode")).default;
                    const qrData = `TICKET:${purchasedTicket.qr_token}`;
                    const qrCodeDataURL = await QRCode.toDataURL(qrData);

                    // ✅ Générer billet en IMAGE
                    await generateTicketImage(
                      {
                        buyer_name: purchasedTicket.buyer_name,
                        buyer_phone: purchasedTicket.buyer_phone,
                        qr_token: purchasedTicket.qr_token,
                        ticket_type_name: ticketTypes.find(tt => tt.id === purchasedTicket.ticket_type_id)?.name || "Standard",
                      },
                      {
                        title: selectedEvent.title,
                        location: selectedEvent.location,
                        date_event: selectedEvent.date_event,
                        image_url: selectedEvent.image_url,
                        organizer_name: selectedEvent.organizer_name || "Organisateur",
                      },
                      qrCodeDataURL
                    );
                  } catch (error) {
                    console.error('❌ Erreur téléchargement billet:', error);
                    alert('Erreur lors du téléchargement du billet. Vérifiez la console.');
                  }
                }}
                className="btn-secondary no-print"
                style={{ fontSize: "1.125rem" }}
              >
                📥 Télécharger le billet
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary no-print"
              >
                🖨️ Imprimer le billet
              </button>
              <button
                onClick={() => {
                  setQrCode(null);
                  setPurchasedTicket(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="btn-outline no-print"
              >
                ✅ Réserver un autre billet
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default Events;
