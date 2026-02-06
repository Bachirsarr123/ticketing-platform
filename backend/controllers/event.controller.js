const pool = require('../db');

// Créer un événement
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date_event, image_url } = req.body;
    const organizerId = req.user.id;

    if (!title || !location || !date_event) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const result = await pool.query(
      `INSERT INTO events (organizer_id, title, description, location, date_event, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [organizerId, title, description, location, date_event, image_url || null]
    );

    res.status(201).json({
      message: 'Événement créé',
      event: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Voir mes événements
exports.getMyEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC',
      [organizerId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Publier un événement
exports.publishEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user.id;

    const result = await pool.query(
      `UPDATE events
       SET is_published = true
       WHERE id = $1 AND organizer_id = $2
       RETURNING *`,
      [eventId, organizerId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }

    res.json({
      message: 'Événement publié',
      event: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Événements publics
exports.getPublicEvents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE is_published = true ORDER BY date_event ASC'
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier un événement
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user.id;
    const { title, description, location, date_event, image_url } = req.body;

    if (!title || !location || !date_event) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    // Vérifier que l'événement appartient à l'organisateur
    const checkResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }

    if (checkResult.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: 'Non autorisé à modifier cet événement' });
    }

    // Mettre à jour l'événement
    const result = await pool.query(
      `UPDATE events
       SET title = $1, description = $2, location = $3, date_event = $4, image_url = $5
       WHERE id = $6 AND organizer_id = $7
       RETURNING *`,
      [title, description, location, date_event, image_url || null, eventId, organizerId]
    );

    res.json({
      message: 'Événement modifié',
      event: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Dépublier un événement
exports.unpublishEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user.id;

    // Vérifier que l'événement appartient à l'organisateur
    const checkResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }

    if (checkResult.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: 'Non autorisé à dépublier cet événement' });
    }

    // Dépublier l'événement
    const result = await pool.query(
      `UPDATE events
       SET is_published = false
       WHERE id = $1 AND organizer_id = $2
       RETURNING *`,
      [eventId, organizerId]
    );

    res.json({
      message: 'Événement dépublié',
      event: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user.id;

    // Vérifier que l'événement appartient à l'organisateur
    const checkResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }

    if (checkResult.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cet événement' });
    }

    // Vérifier s'il y a des tickets vendus
    const ticketsResult = await pool.query(
      'SELECT COUNT(*) as count FROM tickets WHERE event_id = $1',
      [eventId]
    );

    const ticketCount = parseInt(ticketsResult.rows[0].count);

    if (ticketCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cet événement : ${ticketCount} billet(s) déjà vendu(s)`
      });
    }

    // Supprimer d'abord les types de billets associés
    await pool.query(
      'DELETE FROM ticket_types WHERE event_id = $1',
      [eventId]
    );

    // Supprimer l'événement
    await pool.query(
      'DELETE FROM events WHERE id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );

    res.json({
      message: 'Événement supprimé avec succès'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
