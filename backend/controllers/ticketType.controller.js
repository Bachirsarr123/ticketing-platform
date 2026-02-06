const pool = require('../db');

// Créer un type de ticket
exports.createTicketType = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, price, quantity } = req.body;
    const organizerId = req.user.id;

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    // Vérifier que l’événement appartient à l’organizer
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );

    if (eventCheck.rowCount === 0) {
      return res.status(403).json({ message: 'Événement non autorisé' });
    }

    const result = await pool.query(
      `INSERT INTO ticket_types (event_id, name, price, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [eventId, name, price, quantity]
    );

    res.status(201).json({
      message: 'Type de ticket créé',
      ticketType: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Lister les types de tickets d’un événement
exports.getTicketTypesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await pool.query(
      'SELECT * FROM ticket_types WHERE event_id = $1 ORDER BY price ASC',
      [eventId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier un type de ticket
exports.updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    const organizerId = req.user.id;

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    // Vérifier que le ticket type appartient à un événement de l'organisateur
    const checkResult = await pool.query(
      `SELECT tt.*, e.organizer_id 
       FROM ticket_types tt
       JOIN events e ON tt.event_id = e.id
       WHERE tt.id = $1`,
      [id]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Type de ticket introuvable' });
    }

    if (checkResult.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce type de ticket' });
    }

    // Mettre à jour le type de ticket
    const result = await pool.query(
      `UPDATE ticket_types
       SET name = $1, price = $2, quantity = $3
       WHERE id = $4
       RETURNING *`,
      [name, price, quantity, id]
    );

    res.json({
      message: 'Type de ticket modifié',
      ticketType: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un type de ticket
exports.deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;

    // Vérifier que le ticket type appartient à un événement de l'organisateur
    const checkResult = await pool.query(
      `SELECT tt.*, e.organizer_id 
       FROM ticket_types tt
       JOIN events e ON tt.event_id = e.id
       WHERE tt.id = $1`,
      [id]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Type de ticket introuvable' });
    }

    if (checkResult.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce type de ticket' });
    }

    // Vérifier s'il y a des tickets vendus pour ce type
    const ticketsResult = await pool.query(
      'SELECT COUNT(*) as count FROM tickets WHERE ticket_type_id = $1',
      [id]
    );

    const ticketCount = parseInt(ticketsResult.rows[0].count);

    if (ticketCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer ce type de ticket : ${ticketCount} billet(s) déjà vendu(s)`
      });
    }

    // Supprimer le type de ticket
    await pool.query(
      'DELETE FROM ticket_types WHERE id = $1',
      [id]
    );

    res.json({
      message: 'Type de ticket supprimé avec succès'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
