const pool = require('../db');

// ===============================================
// GESTION DES ORGANISATEURS
// ===============================================

// Récupérer tous les organisateurs avec statistiques
exports.getAllOrganizers = async (req, res) => {
    try {
        console.log('🔍 Admin: Récupération des organisateurs...');

        const result = await pool.query(
            `SELECT 
        u.id,
        u.name,
        u.email,
        u.is_active,
        u.created_at,
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT t.id) as total_tickets_sold,
        COALESCE(SUM(tt.price), 0) as total_revenue
       FROM users u
       LEFT JOIN events e ON u.id = e.organizer_id
       LEFT JOIN tickets t ON e.id = t.event_id
       LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE u.role = 'organizer'
       GROUP BY u.id, u.name, u.email, u.is_active, u.created_at
       ORDER BY u.created_at DESC`
        );

        console.log(`✅ ${result.rows.length} organisateur(s) trouvé(s)`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Erreur récupération organisateurs:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Activer/Désactiver un organisateur
exports.toggleOrganizerStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = $1 AND role = $2 RETURNING *',
            [id, 'organizer']
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Organisateur introuvable' });
        }

        res.json({
            message: result.rows[0].is_active ? 'Organisateur activé' : 'Organisateur désactivé',
            organizer: result.rows[0]
        });
    } catch (err) {
        console.error('❌ Erreur toggle organisateur:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer un organisateur
exports.deleteOrganizer = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que ce n'est pas un admin
        const checkResult = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [id]
        );

        if (checkResult.rowCount === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        if (checkResult.rows[0].role === 'admin') {
            return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
        }

        // Supprimer (CASCADE supprime événements et tickets)
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({ message: 'Organisateur supprimé avec succès' });
    } catch (err) {
        console.error('❌ Erreur suppression organisateur:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// ===============================================
// GESTION DES ÉVÉNEMENTS
// ===============================================

// Récupérer tous les événements
exports.getAllEvents = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        e.*,
        u.name as organizer_name,
        u.email as organizer_email,
        COUNT(DISTINCT t.id) as tickets_sold
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       LEFT JOIN tickets t ON e.id = t.event_id
       GROUP BY e.id, u.name, u.email
       ORDER BY e.created_at DESC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error('❌ Erreur récupération événements:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Modifier n'importe quel événement
exports.updateAnyEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, date_event } = req.body;

        const result = await pool.query(
            `UPDATE events 
       SET title = $1, description = $2, location = $3, date_event = $4
       WHERE id = $5
       RETURNING *`,
            [title, description, location, date_event, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Événement introuvable' });
        }

        res.json({
            message: 'Événement modifié avec succès',
            event: result.rows[0]
        });
    } catch (err) {
        console.error('❌ Erreur modification événement:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Publier/Dépublier un événement
exports.toggleEventPublication = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE events SET is_published = NOT is_published WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Événement introuvable' });
        }

        res.json({
            message: result.rows[0].is_published ? 'Événement publié' : 'Événement dépublié',
            event: result.rows[0]
        });
    } catch (err) {
        console.error('❌ Erreur toggle publication:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer n'importe quel événement
exports.deleteAnyEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier s'il y a des billets vendus
        const ticketsResult = await pool.query(
            'SELECT COUNT(*) as count FROM tickets WHERE event_id = $1',
            [id]
        );

        const ticketCount = parseInt(ticketsResult.rows[0].count);

        if (ticketCount > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : ${ticketCount} billet(s) vendu(s)`,
                ticketCount
            });
        }

        await pool.query('DELETE FROM events WHERE id = $1', [id]);

        res.json({ message: 'Événement supprimé avec succès' });
    } catch (err) {
        console.error('❌ Erreur suppression événement:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// ===============================================
// STATISTIQUES & ANALYTICS
// ===============================================

// Statistiques globales
exports.getSalesStats = async (req, res) => {
    try {
        const stats = await pool.query(
            `SELECT 
        COUNT(DISTINCT u.id) as total_organizers,
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT t.id) as total_tickets_sold,
        COALESCE(SUM(tt.price), 0) as total_revenue
       FROM users u
       LEFT JOIN events e ON u.id = e.organizer_id
       LEFT JOIN tickets t ON e.id = t.event_id
       LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE u.role = 'organizer'`
        );

        // Top organisateurs
        const topOrganizers = await pool.query(
            `SELECT 
        u.name,
        COUNT(DISTINCT t.id) as tickets_sold,
        COALESCE(SUM(tt.price), 0) as revenue
       FROM users u
       LEFT JOIN events e ON u.id = e.organizer_id
       LEFT JOIN tickets t ON e.id = t.event_id
       LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE u.role = 'organizer'
       GROUP BY u.id, u.name
       ORDER BY tickets_sold DESC
       LIMIT 5`
        );

        // Top événements
        const topEvents = await pool.query(
            `SELECT 
        e.title,
        u.name as organizer_name,
        COUNT(t.id) as tickets_sold
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       LEFT JOIN tickets t ON e.id = t.event_id
       GROUP BY e.id, e.title, u.name
       ORDER BY tickets_sold DESC
       LIMIT 5`
        );

        res.json({
            global: stats.rows[0],
            topOrganizers: topOrganizers.rows,
            topEvents: topEvents.rows
        });
    } catch (err) {
        console.error('❌ Erreur statistiques:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Statistiques par organisateur
exports.getOrganizerStats = async (req, res) => {
    try {
        const { id } = req.params;

        const stats = await pool.query(
            `SELECT 
        u.name,
        u.email,
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT t.id) as total_tickets_sold,
        COALESCE(SUM(tt.price), 0) as total_revenue
       FROM users u
       LEFT JOIN events e ON u.id = e.organizer_id
       LEFT JOIN tickets t ON e.id = t.event_id
       LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE u.id = $1 AND u.role = 'organizer'
       GROUP BY u.id, u.name, u.email`,
            [id]
        );

        if (stats.rowCount === 0) {
            return res.status(404).json({ message: 'Organisateur introuvable' });
        }

        // Événements de cet organisateur
        const events = await pool.query(
            `SELECT 
        e.title,
        e.is_published,
        COUNT(t.id) as tickets_sold
       FROM events e
       LEFT JOIN tickets t ON e.id = t.event_id
       WHERE e.organizer_id = $1
       GROUP BY e.id, e.title, e.is_published
       ORDER BY tickets_sold DESC`,
            [id]
        );

        res.json({
            organizer: stats.rows[0],
            events: events.rows
        });
    } catch (err) {
        console.error('❌ Erreur stats organisateur:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
