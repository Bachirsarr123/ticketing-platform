const pool = require("../db");

exports.scanTicket = async (req, res) => {
  try {
    // ✅ LECTURE CORRECTE DU TOKEN
    const { qr_token } = req.body;

    console.log("QR TOKEN REÇU :", qr_token); // 🔥 DEBUG IMPORTANT

    if (!qr_token) {
      return res.status(400).json({ message: "Jeton manquant" });
    }

    // 🔍 Vérifier le ticket
    const result = await pool.query(
      "SELECT * FROM tickets WHERE qr_token = $1",
      [qr_token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ticket invalide" });
    }

    const ticket = result.rows[0];

    // ❌ Vérifier si déjà utilisé
    if (ticket.is_used) {
      return res.status(400).json({
        message: "Ticket déjà utilisé",
        used_at: ticket.purchased_at
      });
    }

    // ✅ Marquer comme utilisé
    await pool.query(
      "UPDATE tickets SET is_used = true WHERE id = $1",
      [ticket.id]
    );

    res.json({
      message: "Ticket valide — accès autorisé",
      ticket,
    });

  } catch (err) {
    console.error("ERREUR SCAN :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
