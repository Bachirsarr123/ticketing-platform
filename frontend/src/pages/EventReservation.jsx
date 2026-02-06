import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, ticketTypeAPI, purchaseAPI } from '../api/api';
import { generateTicketImage } from '../utils/generateTicketImage';

function EventReservation() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Reservation states
    const [qrCode, setQrCode] = useState(null);
    const [purchasedTicket, setPurchasedTicket] = useState(null);

    // Form state for reservation
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [reservationForm, setReservationForm] = useState({
        buyer_name: '',
        buyer_phone: '',
        buyer_email: ''
    });

    useEffect(() => {
        loadEventAndTickets();
    }, [eventId]);

    const loadEventAndTickets = async () => {
        try {
            setLoading(true);
            const eventsResponse = await eventAPI.getPublicEvents();
            const foundEvent = eventsResponse.data.find(e => e.id === parseInt(eventId));

            if (!foundEvent) {
                setError('Événement introuvable');
                setLoading(false);
                return;
            }

            setEvent(foundEvent);
            const ticketsResponse = await ticketTypeAPI.getByEvent(eventId);
            setTicketTypes(ticketsResponse.data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading event data:', err);
            setError('Erreur lors du chargement de l\'événement');
            setLoading(false);
        }
    };

    // Open form for a specific ticket type
    const handleSelectTicket = (ticketType) => {
        setSelectedTicketType(ticketType);
        // Reset form but keep email if previously entered
        setReservationForm(prev => ({
            buyer_name: '',
            buyer_phone: '',
            buyer_email: prev.buyer_email || ''
        }));
        // Scroll to form
        setTimeout(() => {
            document.getElementById("reservation-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    };

    // Handle form submission
    const handleReservationSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTicketType) return;
        if (!reservationForm.buyer_name || !reservationForm.buyer_phone) {
            alert("Nom et téléphone sont obligatoires");
            return;
        }

        try {
            const response = await purchaseAPI.purchaseTicket(selectedTicketType.id, {
                buyer_name: reservationForm.buyer_name,
                buyer_phone: reservationForm.buyer_phone,
                buyer_email: reservationForm.buyer_email || undefined,
            });

            setQrCode(response.data.qr);
            setPurchasedTicket(response.data.ticket);

            // Close form and reload
            setSelectedTicketType(null);
            loadEventAndTickets();

            // Scroll to QR code
            setTimeout(() => {
                document.getElementById("qr-code-section")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        } catch (err) {
            console.error("Error purchasing ticket:", err);
            alert(err.response?.data?.message || "Erreur lors de la réservation");
        }
    };

    const handleDownloadTicket = async () => {
        /* ... existing download logic ... */
        try {
            const QRCode = (await import("qrcode")).default;
            const qrData = `TICKET:${purchasedTicket.qr_token}`;
            const qrCodeDataURL = await QRCode.toDataURL(qrData);
            /* ... generateTicketImage logic ... */
            await generateTicketImage(
                {
                    buyer_name: purchasedTicket.buyer_name,
                    buyer_phone: purchasedTicket.buyer_phone,
                    qr_token: purchasedTicket.qr_token,
                    ticket_type_name: ticketTypes.find(tt => tt.id === purchasedTicket.ticket_type_id)?.name || "Standard",
                },
                {
                    title: event.title,
                    location: event.location,
                    date_event: event.date_event,
                    image_url: event.image_url,
                    organizer_name: event.organizer_name || "Organisateur",
                },
                qrCodeDataURL
            );
        } catch (error) {
            console.error('❌ Erreur téléchargement billet:', error);
            alert('Erreur: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>❌ {error}</h2>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Retour aux événements
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/')}
                className="btn-outline"
                style={{ marginBottom: '2rem' }}
            >
                ← Retour aux événements
            </button>

            {/* Event Header */}
            <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
                {event.image_url && (
                    <div style={{ height: '300px', overflow: 'hidden', margin: '-1.5rem -1.5rem 1.5rem -1.5rem' }}>
                        <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.image_url}`}
                            alt={event.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                <h1 style={{ marginBottom: '1rem', color: 'var(--primary-600)' }}>{event.title}</h1>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem', color: 'var(--gray-700)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📅</span>
                        <strong>
                            {new Date(event.date_event).toLocaleDateString('fr-FR', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📍</span>
                        <strong>{event.location}</strong>
                    </div>
                </div>

                {event.description && (
                    <p style={{ marginTop: '1rem', color: 'var(--gray-600)', lineHeight: '1.6' }}>
                        {event.description}
                    </p>
                )}
            </div>

            {/* SUCCESS: Ticket Generated */}
            {qrCode && purchasedTicket && (
                <div
                    id="qr-code-section"
                    className="card animate-fadeIn"
                    style={{
                        marginBottom: '2rem',
                        background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                        border: "3px solid var(--secondary-500)",
                        textAlign: "center"
                    }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                    <h2 style={{ color: "var(--secondary-600)", marginBottom: "1rem" }}>Votre Billet est Prêt !</h2>

                    <div className="alert alert-success" style={{ display: "inline-block", marginBottom: "1.5rem" }}>
                        Billet pour <strong>{purchasedTicket.buyer_name}</strong>
                    </div>

                    <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
                        <img src={qrCode} alt="QR Code" style={{ maxWidth: '250px' }} />
                    </div>

                    <p style={{ fontFamily: 'monospace', color: 'var(--gray-600)' }}>Token: {purchasedTicket.qr_token}</p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <button onClick={handleDownloadTicket} className="btn-secondary">
                            📥 Télécharger
                        </button>
                        <button onClick={() => { setQrCode(null); setPurchasedTicket(null); }} className="btn-outline">
                            🔄 Nouvelle réservation
                        </button>
                    </div>
                </div>
            )}

            {/* Ticket Types & Reservation Form */}
            {!qrCode && (
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem' }}>🎫 Billets Disponibles</h2>

                    {ticketTypes.length === 0 ? (
                        <p className="text-center text-muted">Aucun billet disponible</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {ticketTypes.map(ticket => (
                                <div key={ticket.id} style={{
                                    border: selectedTicketType?.id === ticket.id ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    background: selectedTicketType?.id === ticket.id ? 'white' : 'var(--gray-50)'
                                }}>
                                    {/* Ticket Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        cursor: ticket.quantity > 0 ? 'pointer' : 'default',
                                    }}
                                        onClick={() => ticket.quantity > 0 && handleSelectTicket(ticket)}
                                    >
                                        <div>
                                            <h3 style={{ margin: 0, color: 'var(--primary-600)' }}>{ticket.name}</h3>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--secondary-600)', marginTop: '0.25rem' }}>
                                                {ticket.price} €
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                {ticket.quantity > 0 ? `${ticket.quantity} restants` : 'Épuisé'}
                                            </div>
                                            {ticket.quantity > 0 && selectedTicketType?.id !== ticket.id && (
                                                <button className="btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                                                    Choisir
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Embedded Reservation Form */}
                                    {selectedTicketType?.id === ticket.id && (
                                        <div id="reservation-form" className="animate-fadeIn" style={{
                                            padding: '1.5rem',
                                            borderTop: '1px solid var(--gray-200)',
                                            background: 'var(--primary-50)'
                                        }}>
                                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                📝 Vos coordonnées
                                            </h4>

                                            <form onSubmit={handleReservationSubmit}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label htmlFor="buyer_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nom complet *</label>
                                                    <input
                                                        type="text"
                                                        id="buyer_name"
                                                        value={reservationForm.buyer_name}
                                                        onChange={(e) => setReservationForm({ ...reservationForm, buyer_name: e.target.value })}
                                                        required
                                                        placeholder="Ex: Jean Dupont"
                                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                                    />
                                                </div>

                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label htmlFor="buyer_phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Téléphone *</label>
                                                    <input
                                                        type="tel"
                                                        id="buyer_phone"
                                                        value={reservationForm.buyer_phone}
                                                        onChange={(e) => setReservationForm({ ...reservationForm, buyer_phone: e.target.value })}
                                                        required
                                                        placeholder="Ex: 06 12 34 56 78"
                                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                                    />
                                                </div>

                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <label htmlFor="buyer_email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email (optionnel)</label>
                                                    <input
                                                        type="email"
                                                        id="buyer_email"
                                                        value={reservationForm.buyer_email}
                                                        onChange={(e) => setReservationForm({ ...reservationForm, buyer_email: e.target.value })}
                                                        placeholder="Pour recevoir votre billet par mail"
                                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                                    />
                                                    <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                        Nous vous enverrons également le billet par email si vous le renseignez.
                                                    </p>
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button type="button" onClick={() => setSelectedTicketType(null)} className="btn-outline" style={{ flex: 1 }}>
                                                        Annuler
                                                    </button>
                                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                                        ✅ Confirmer la réservation
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default EventReservation;
