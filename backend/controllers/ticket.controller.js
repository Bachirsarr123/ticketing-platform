const pool = require('../db');

// Récupérer tous les billets des événements de l'organisateur
exports.getMyEventsTickets = async (req, res) => {
    try {
        const organizerId = req.user.id;
        console.log('🎫 Récupération billets pour organisateur ID:', organizerId);

        const result = await pool.query(
            `SELECT 
        t.id,
        t.buyer_name,
        t.buyer_phone,
        t.qr_token,
        t.is_used,
        t.created_at,
        e.id as event_id,
        e.title as event_title,
        e.location as event_location,
        e.date_event,
        e.image_url as event_image_url,
        tt.id as ticket_type_id,
        tt.name as ticket_type_name,
        tt.price as ticket_price
       FROM tickets t
       JOIN ticket_types tt ON t.ticket_type_id = tt.id
       JOIN events e ON t.event_id = e.id
       WHERE e.organizer_id = $1
       ORDER BY t.created_at DESC`,
            [organizerId]
        );

        console.log(`✅ ${result.rows.length} billet(s) trouvé(s)`);
        res.json(result.rows);

    } catch (err) {
        console.error('❌ Erreur récupération billets:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer tous les billets d'un événement spécifique (pour cache offline)
exports.getEventTickets = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organizerId = req.user.id;

        console.log(`🎫 Récupération billets pour événement ${eventId}`);

        // Vérifier que l'événement appartient à l'organisateur
        const eventCheck = await pool.query(
            'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
            [eventId, organizerId]
        );

        if (eventCheck.rowCount === 0) {
            return res.status(403).json({ message: 'Accès refusé à cet événement' });
        }

        // Récupérer tous les billets
        const result = await pool.query(
            `SELECT 
        t.id,
        t.buyer_name,
        t.buyer_phone,
        t.qr_token,
        t.is_used,
        t.created_at,
        t.event_id,
        tt.id as ticket_type_id,
        tt.name as ticket_type_name,
        tt.price as ticket_price
       FROM tickets t
       JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE t.event_id = $1
       ORDER BY t.created_at DESC`,
            [eventId]
        );

        console.log(`✅ ${result.rows.length} billet(s) trouvé(s) pour événement ${eventId}`);
        res.json(result.rows);

    } catch (err) {
        console.error('❌ Erreur récupération billets événement:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
