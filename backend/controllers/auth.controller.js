const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;


// INSCRIPTION
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    // 🔒 SÉCURITÉ : Empêcher la création d'admin via API
    if (role === 'admin') {
      return res.status(403).json({
        message: 'Création de compte administrateur interdite'
      });
    }

    // Force le rôle à 'organizer' même si autre chose est envoyé
    const userRole = 'organizer';

    // Chiffrement du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertion en base
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, name, email, role`,
      [name, email, passwordHash, userRole]
    );

    res.status(201).json({
      message: 'Utilisateur créé',
      user: result.rows[0],
    });

  } catch (err) {
    console.error('❌ Erreur inscription:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// CONNEXION
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ message: 'Email incorrect' });
    }

    const user = userRes.rows[0];

    // Vérifier si le compte est actif (pour les organisateurs)
    if (user.role === 'organizer' && user.is_active === false) {
      return res.status(403).json({
        message: 'Compte désactivé. Contactez un administrateur.'
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ RETOURNER LES DONNÉES UTILISATEUR COMPLÈTES
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('❌ Erreur connexion:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
