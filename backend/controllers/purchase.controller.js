const pool = require('../db');
const crypto = require('crypto');
const QRCode = require('qrcode');
const emailService = require('../services/email.service');

// Acheter un ticket (réservation publique)
exports.purchaseTicket = async (req, res) => {
  const client = await pool.connect();

  try {
    const { ticketTypeId } = req.params;
    const { buyer_name, buyer_phone, buyer_email } = req.body;

    // ✅ Validation
    if (!buyer_name || !buyer_phone) {
      return res.status(400).json({ message: 'Nom et téléphone obligatoires' });
    }

    await client.query('BEGIN');

    // 1️⃣ Vérifier le stock
    const typeRes = await client.query(
      'SELECT * FROM ticket_types WHERE id = $1 FOR UPDATE',
      [ticketTypeId]
    );

    if (typeRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Type de ticket introuvable' });
    }

    const ticketType = typeRes.rows[0];

    if (ticketType.quantity <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Stock épuisé' });
    }

    // 2️⃣ Décrémenter le stock
    await client.query(
      'UPDATE ticket_types SET quantity = quantity - 1 WHERE id = $1',
      [ticketTypeId]
    );

    // 3️⃣ Générer QR token
    const qrToken = crypto.randomBytes(32).toString('hex');

    // 4️⃣ Créer le ticket (SANS AUTH)
    const ticketRes = await client.query(
      `INSERT INTO tickets (event_id, ticket_type_id, buyer_name, buyer_phone, qr_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        ticketType.event_id,
        ticketTypeId,
        buyer_name,
        buyer_phone,
        qrToken
      ]
    );

    const ticket = ticketRes.rows[0];

    // 5️⃣ Récupérer les détails de l'événement et de l'organisateur
    const eventRes = await client.query(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [ticketType.event_id]
    );

    const event = eventRes.rows[0];

    // 6️⃣ Générer le QR code
    const qrData = `TICKET:${qrToken}`;
    const qrImage = await QRCode.toDataURL(qrData);

    await client.query('COMMIT');

    // 7️⃣ Envoyer l'email de confirmation (si email fourni)
    if (buyer_email) {
      try {
        await emailService.sendTicketConfirmation({
          to: buyer_email,
          ticket: ticket,
          event: event,
          ticketType: ticketType,
          organizerName: event.organizer_name
        });
        console.log('✅ Email de confirmation envoyé à:', buyer_email);
      } catch (emailError) {
        // Ne pas bloquer la réponse si l'email échoue
        console.error('⚠️ Erreur envoi email (non bloquant):', emailError.message);
      }
    }

    res.status(201).json({
      message: 'Ticket réservé',
      ticket: ticket,
      qr: qrImage
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
};
