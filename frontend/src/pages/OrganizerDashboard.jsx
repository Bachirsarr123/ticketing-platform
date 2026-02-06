import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventAPI, ticketTypeAPI, ticketAPI } from "../api/api";
import { generateTicketImage } from "../utils/generateTicketImage";
import ImageUpload from "../components/ImageUpload";
import QRCode from "qrcode";

function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    location: "",
    date_event: "",
    image_url: "",
  });

  // Ticket types state (array of tickets)
  // Each ticket has: { id (if existing), name, price, quantity, _deleted (for marking deletion) }
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "", quantity: "" }]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  // Tickets management
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showTickets, setShowTickets] = useState(false);

  // Load organizer's events
  useEffect(() => {
    loadMyEvents();
    loadMyTickets();
  }, []);

  const loadMyEvents = async () => {
    try {
      const response = await eventAPI.getMyEvents();
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Erreur lors du chargement des événements");
      setLoading(false);
    }
  };

  const loadMyTickets = async () => {
    setLoadingTickets(true);
    try {
      console.log("🎫 Chargement des billets...");
      const response = await ticketAPI.getMyEventsTickets();
      console.log("✅ Billets reçus:", response.data);
      setTickets(response.data);
      setLoadingTickets(false);
    } catch (err) {
      console.error("❌ Error loading tickets:", err);
      console.error("Response:", err.response?.data);
      setLoadingTickets(false);
    }
  };

  const handleDownloadTicket = async (ticket) => {
    try {
      // Generate QR code
      const qrData = `TICKET:${ticket.qr_token}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData);

      // ✅ Télécharger billet en IMAGE
      await generateTicketImage(
        {
          buyer_name: ticket.buyer_name,
          buyer_phone: ticket.buyer_phone,
          qr_token: ticket.qr_token,
          ticket_type_name: ticket.ticket_type_name,
        },
        {
          title: ticket.event_title,
          location: ticket.event_location,
          date_event: ticket.date_event,
          image_url: ticket.event_image_url,
          organizer_name: user?.name || "Organisateur",
        },
        qrCodeDataURL
      );

      setSuccess(`✅ Billet téléchargé pour ${ticket.buyer_name}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error downloading ticket:", err);
      setError("Erreur lors du téléchargement du billet");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Add a new ticket type to the form
  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "", quantity: "" }]);
  };

  // Remove a ticket type from the form
  const removeTicketType = (index) => {
    const ticket = ticketTypes[index];

    if (ticket.id) {
      // Existing ticket - mark for deletion
      const updated = [...ticketTypes];
      updated[index]._deleted = true;
      setTicketTypes(updated);
    } else {
      // New ticket - just remove from array
      if (ticketTypes.filter(t => !t._deleted).length > 1) {
        setTicketTypes(ticketTypes.filter((_, i) => i !== index));
      }
    }
  };

  // Update a specific ticket type
  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index][field] = value;
    setTicketTypes(updated);
  };

  // Create event with all tickets
  const handleCreateEventWithTickets = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!eventForm.title || !eventForm.location || !eventForm.date_event) {
      setError("Titre, lieu et date sont obligatoires");
      return;
    }

    // Validate at least one ticket
    const validTickets = ticketTypes.filter((t) => t.name && t.price && t.quantity);

    if (validTickets.length === 0) {
      setError("Vous devez créer au moins un type de billet");
      return;
    }

    setCreating(true);

    try {
      // Step 1: Create the event
      const eventResponse = await eventAPI.createEvent(eventForm);
      const createdEvent = eventResponse.data.event; // ✅ FIX: Correct API response structure
      const eventId = createdEvent.id;

      console.log("✅ Événement créé:", createdEvent);

      // Step 2: Create all ticket types for this event
      const ticketPromises = validTickets.map((ticket) =>
        ticketTypeAPI.create(eventId, {
          name: ticket.name,
          price: parseFloat(ticket.price),
          quantity: parseInt(ticket.quantity),
        })
      );

      await Promise.all(ticketPromises);

      console.log(`✅ ${validTickets.length} type(s) de billet créé(s)`);

      // Success!
      setSuccess(
        `✅ Événement "${eventForm.title}" créé avec ${validTickets.length} type(s) de billet !`
      );

      // Reload events first
      await loadMyEvents();

      // ✅ FIX: Reset form AFTER reload to show tickets
      setEventForm({ title: "", description: "", location: "", date_event: "", image_url: "" });
      setTicketTypes([{ name: "", price: "", quantity: "" }]);
      setShowCreateForm(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("❌ Erreur création:", err);
      setError(
        err.response?.data?.message ||
        "Erreur lors de la création de l'événement ou des billets"
      );
    } finally {
      setCreating(false);
    }
  };

  // Start editing an event
  const handleStartEdit = async (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      location: event.location,
      date_event: new Date(event.date_event).toISOString().slice(0, 16),
      image_url: event.image_url || "", // ✅ FIX: Preserve existing image
    });
    setShowCreateForm(false);
    setError("");

    // Load existing ticket types for this event
    try {
      const response = await ticketTypeAPI.getByEvent(event.id);
      const existingTickets = response.data.map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price.toString(),
        quantity: ticket.quantity.toString(),
      }));

      // If no tickets, start with one empty
      setTicketTypes(existingTickets.length > 0 ? existingTickets : [{ name: "", price: "", quantity: "" }]);
    } catch (err) {
      console.error("Error loading ticket types:", err);
      setTicketTypes([{ name: "", price: "", quantity: "" }]);
    }
  };

  // Update event with all tickets
  const handleUpdateEventWithTickets = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!eventForm.title || !eventForm.location || !eventForm.date_event) {
      setError("Titre, lieu et date sont obligatoires");
      return;
    }

    // Validate at least one non-deleted ticket
    const validTickets = ticketTypes.filter((t) => !t._deleted && t.name && t.price && t.quantity);

    if (validTickets.length === 0) {
      setError("Vous devez avoir au moins un type de billet");
      return;
    }

    setCreating(true);

    try {
      // Step 1: Update the event
      await eventAPI.updateEvent(editingEvent.id, eventForm);
      console.log("✅ Événement modifié");

      // Step 2: Process tickets
      const promises = [];

      for (const ticket of ticketTypes) {
        if (ticket._deleted && ticket.id) {
          // Delete existing ticket
          promises.push(ticketTypeAPI.delete(ticket.id));
        } else if (ticket.id && !ticket._deleted) {
          // Update existing ticket
          promises.push(
            ticketTypeAPI.update(ticket.id, {
              name: ticket.name,
              price: parseFloat(ticket.price),
              quantity: parseInt(ticket.quantity),
            })
          );
        } else if (!ticket.id && !ticket._deleted && ticket.name && ticket.price && ticket.quantity) {
          // Create new ticket
          promises.push(
            ticketTypeAPI.create(editingEvent.id, {
              name: ticket.name,
              price: parseFloat(ticket.price),
              quantity: parseInt(ticket.quantity),
            })
          );
        }
      }

      await Promise.all(promises);
      console.log("✅ Tickets mis à jour");

      setSuccess(`✅ Événement "${eventForm.title}" modifié avec succès !`);

      // Reload events first
      await loadMyEvents();

      // ✅ FIX: Reset form AFTER reload
      setEditingEvent(null);
      setEventForm({ title: "", description: "", location: "", date_event: "", image_url: "" });
      setTicketTypes([{ name: "", price: "", quantity: "" }]);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("❌ Erreur modification:", err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
      setTimeout(() => setError(""), 5000);
    } finally {
      setCreating(false);
    }
  };

  // Publish event
  const handlePublishEvent = async (eventId) => {
    try {
      await eventAPI.publishEvent(eventId);
      setSuccess("✅ Événement publié !");
      loadMyEvents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error publishing event:", err);
      setError(err.response?.data?.message || "Erreur lors de la publication");
    }
  };

  // Unpublish event
  const handleUnpublishEvent = async (eventId) => {
    try {
      await eventAPI.unpublishEvent(eventId);
      setSuccess("✅ Événement dépublié !");
      loadMyEvents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error unpublishing event:", err);
      setError(err.response?.data?.message || "Erreur lors de la dépublication");
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'événement "${eventTitle}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      await eventAPI.deleteEvent(eventId);
      setSuccess("✅ Événement supprimé avec succès !");
      loadMyEvents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Copy reservation link
  const copyReservationLink = (eventId) => {
    const link = `${window.location.origin}/events/${eventId}/reservation`;
    navigator.clipboard.writeText(link);
    setSuccess("✅ Lien copié dans le presse-papiers !");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Cancel edit/create
  const handleCancel = () => {
    setEditingEvent(null);
    setShowCreateForm(false);
    setEventForm({ title: "", description: "", location: "", date_event: "" });
    setTicketTypes([{ name: "", price: "", quantity: "" }]);
    setError("");
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem", color: "var(--gray-500)" }}>
          Chargement de votre dashboard...
        </p>
      </div>
    );
  }

  // Determine if we're in form mode (create or edit)
  const isFormMode = showCreateForm || editingEvent;
  const isEditMode = !!editingEvent;

  return (
    <div
      className="container animate-fadeIn"
      style={{ padding: "3rem 1.5rem", minHeight: "calc(100vh - 80px)" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            background: "var(--primary-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          📊 Dashboard Organisateur
        </h1>
        <p className="text-muted" style={{ fontSize: "1.125rem" }}>
          Bienvenue, <strong>{user?.name || user?.email}</strong> 👋
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3" style={{ marginBottom: "3rem" }}>
        <div
          className="card"
          style={{
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</div>
          <h3 style={{ fontSize: "2rem", marginBottom: "0.25rem", color: "var(--primary-600)" }}>
            {events.length}
          </h3>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Événements
          </p>
        </div>
        <div
          className="card"
          style={{
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
          <h3 style={{ fontSize: "2rem", marginBottom: "0.25rem", color: "var(--secondary-600)" }}>
            {events.filter((e) => e.is_published).length}
          </h3>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Publiés
          </p>
        </div>
        <div
          className="card"
          style={{
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⏳</div>
          <h3 style={{ fontSize: "2rem", marginBottom: "0.25rem", color: "var(--accent-600)" }}>
            {events.filter((e) => !e.is_published).length}
          </h3>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Brouillons
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="alert alert-error animate-fadeIn">
          <span style={{ fontSize: "1.25rem" }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success animate-fadeIn">
          <span style={{ fontSize: "1.25rem" }}>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Create/Edit Event Button */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => {
            if (isFormMode) {
              handleCancel();
            } else {
              setShowCreateForm(true);
            }
          }}
          className="btn-primary"
          style={{ fontSize: "1.125rem" }}
        >
          {isFormMode ? "❌ Annuler" : "➕ Créer un événement"}
        </button>
      </div>

      {/* Unified Create/Edit Form */}
      {isFormMode && (
        <div
          className="card animate-fadeIn"
          style={{
            marginBottom: "3rem",
            background: isEditMode
              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>
            {isEditMode ? "✏️ Modifier l'Événement" : "✨ Nouvel Événement"}
          </h2>
          <form onSubmit={isEditMode ? handleUpdateEventWithTickets : handleCreateEventWithTickets}>
            {/* Event Information */}
            <div
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                backgroundColor: "white",
                borderRadius: "var(--radius-lg)",
                border: "2px solid var(--primary-500)",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
                📋 Informations de l'événement
              </h3>

              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="title">Titre *</label>
                <input
                  type="text"
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Concert de Jazz, Festival d'été..."
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Décrivez votre événement..."
                  rows="4"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                currentImage={eventForm.image_url ? `http://localhost:5000${eventForm.image_url}` : null}
                onImageUploaded={(imageUrl) => setEventForm({ ...eventForm, image_url: imageUrl })}
                onImageRemoved={() => setEventForm({ ...eventForm, image_url: "" })}
              />

              <div className="grid grid-cols-2" style={{ marginBottom: 0 }}>
                <div>
                  <label htmlFor="location">Lieu *</label>
                  <input
                    type="text"
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Salle de concert, Paris"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="date_event">Date et heure *</label>
                  <input
                    type="datetime-local"
                    id="date_event"
                    value={eventForm.date_event}
                    onChange={(e) => setEventForm({ ...eventForm, date_event: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ticket Types Section */}
            <div
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                backgroundColor: "white",
                borderRadius: "var(--radius-lg)",
                border: "2px solid var(--secondary-500)",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
                🎫 Types de billets *
              </h3>

              {ticketTypes.filter(t => !t._deleted).map((ticket, index) => {
                const actualIndex = ticketTypes.indexOf(ticket);
                return (
                  <div
                    key={actualIndex}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      backgroundColor: "var(--gray-50)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--gray-200)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--gray-700)" }}>
                        {ticket.id ? `Billet existant #${ticket.id}` : `Nouveau billet #${index + 1}`}
                      </h4>
                      {ticketTypes.filter(t => !t._deleted).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(actualIndex)}
                          className="btn-danger"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3">
                      <div>
                        <label htmlFor={`ticket_name_${actualIndex}`}>Nom du ticket</label>
                        <input
                          type="text"
                          id={`ticket_name_${actualIndex}`}
                          value={ticket.name}
                          onChange={(e) => updateTicketType(actualIndex, "name", e.target.value)}
                          placeholder="VIP, Standard, Étudiant..."
                        />
                      </div>

                      <div>
                        <label htmlFor={`ticket_price_${actualIndex}`}>Prix (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          id={`ticket_price_${actualIndex}`}
                          value={ticket.price}
                          onChange={(e) => updateTicketType(actualIndex, "price", e.target.value)}
                          placeholder="25.00"
                        />
                      </div>

                      <div>
                        <label htmlFor={`ticket_quantity_${actualIndex}`}>Quantité</label>
                        <input
                          type="number"
                          id={`ticket_quantity_${actualIndex}`}
                          value={ticket.quantity}
                          onChange={(e) => updateTicketType(actualIndex, "quantity", e.target.value)}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addTicketType}
                className="btn-outline"
                style={{ width: "100%", marginTop: "1rem" }}
              >
                ➕ Ajouter un type de billet
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={creating}
              className="btn-secondary"
              style={{ fontSize: "1.25rem", padding: "1rem 2rem" }}
            >
              {creating ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="spinner"
                    style={{ width: "24px", height: "24px", borderWidth: "3px" }}
                  ></div>
                  <span>{isEditMode ? "Modification en cours..." : "Création en cours..."}</span>
                </span>
              ) : (
                <>{isEditMode ? "💾 Enregistrer les modifications" : "🚀 Créer l'événement avec les billets"}</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Events List */}
      {!isFormMode && (
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>📋 Mes Événements ({events.length})</h2>

          {events.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎭</div>
              <h3 style={{ color: "var(--gray-600)", fontWeight: "500", marginBottom: "1rem" }}>
                Vous n'avez pas encore créé d'événement
              </h3>
              <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
                Cliquez sur "Créer un événement" pour commencer
              </p>
              <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                ➕ Créer mon premier événement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1" style={{ gap: "1.5rem" }}>
              {events.map((event) => (
                <div key={event.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>{event.title}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--gray-600)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span>📍</span> {event.location}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--gray-600)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span>📅</span> {new Date(event.date_event).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      {event.description && (
                        <p style={{ marginTop: "1rem", color: "var(--gray-500)", marginBottom: 0 }}>
                          {event.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={event.is_published ? "badge badge-success" : "badge badge-warning"}
                    >
                      {event.is_published ? "✅ PUBLIÉ" : "⏳ BROUILLON"}
                    </span>
                  </div>

                  <div className="card-footer" style={{ gap: "0.75rem", flexDirection: "column" }}>
                    <button
                      onClick={() => copyReservationLink(event.id)}
                      className="btn-outline"
                      style={{ width: "100%", borderColor: "var(--primary-500)", color: "var(--primary-600)" }}
                    >
                      📋 Copier le lien de réservation
                    </button>

                    <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                      <button
                        onClick={() => handleStartEdit(event)}
                        className="btn-primary"
                        style={{ flex: 1 }}
                      >
                        ✏️ Modifier
                      </button>

                      {event.is_published ? (
                        <button
                          onClick={() => handleUnpublishEvent(event.id)}
                          className="btn-outline"
                          style={{ flex: 1 }}
                        >
                          📴 Dépublier
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublishEvent(event.id)}
                          className="btn-secondary"
                          style={{ flex: 1 }}
                        >
                          📢 Publier
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="btn-danger"
                        style={{ flex: 1 }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tickets Management Section */}
      {!isFormMode && (
        <div style={{ marginTop: "4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2>🎫 Billets Réservés ({tickets.length})</h2>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => {
                  loadMyTickets();
                  setSuccess("🔄 Billets rechargés !");
                  setTimeout(() => setSuccess(""), 2000);
                }}
                className="btn-secondary"
                disabled={loadingTickets}
              >
                🔄 Rafraîchir
              </button>
              <button
                onClick={() => setShowTickets(!showTickets)}
                className="btn-outline"
              >
                {showTickets ? "Masquer les billets" : "Afficher les billets"}
              </button>
            </div>
          </div>

          {showTickets && (
            <>
              {loadingTickets ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: "1rem", color: "var(--gray-500)" }}>
                    Chargement des billets...
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎫</div>
                  <h3 style={{ color: "var(--gray-600)", fontWeight: "500", marginBottom: "0.5rem" }}>
                    Aucun billet réservé
                  </h3>
                  <p className="text-muted">
                    Les billets réservés pour vos événements apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="card">
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                          <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Client</th>
                          <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Contact</th>
                          <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Événement</th>
                          <th style={{ padding: "1rem", textAlign: "left", color: "var(--gray-700)" }}>Type</th>
                          <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Statut</th>
                          <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Date</th>
                          <th style={{ padding: "1rem", textAlign: "center", color: "var(--gray-700)" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                            <td style={{ padding: "1rem" }}>
                              <strong>{ticket.buyer_name}</strong>
                            </td>
                            <td style={{ padding: "1rem", color: "var(--gray-600)", fontSize: "0.875rem" }}>
                              {ticket.buyer_phone}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div style={{ fontSize: "0.875rem", color: "var(--gray-700)" }}>
                                {ticket.event_title}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                                📍 {ticket.event_location}
                              </div>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <span className="badge badge-primary">
                                {ticket.ticket_type_name}
                              </span>
                            </td>
                            <td style={{ padding: "1rem", textAlign: "center" }}>
                              {ticket.is_used ? (
                                <span className="badge badge-success">✅ Utilisé</span>
                              ) : (
                                <span className="badge badge-warning">⏳ Réservé</span>
                              )}
                            </td>
                            <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                              {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                            </td>
                            <td style={{ padding: "1rem", textAlign: "center" }}>
                              <button
                                onClick={() => handleDownloadTicket(ticket)}
                                className="btn-primary"
                                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                              >
                                📥 Télécharger
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default OrganizerDashboard;
