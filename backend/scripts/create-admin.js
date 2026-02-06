const bcrypt = require('bcryptjs');
const pool = require('../db');

/**
 * Script pour créer un administrateur
 * Usage: node backend/scripts/create-admin.js
 */

async function createAdmin() {
    try {
        // ⚠️ MODIFIER CES VALEURS
        const name = 'Super Admin';
        const email = 'admin@ticketing.com';
        const password = 'Admin123!'; // ⚠️ Changer ce mot de passe !

        console.log('🔐 Création d\'un administrateur...');

        // Vérifier si l'email existe déjà
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rowCount > 0) {
            console.error('❌ Un utilisateur avec cet email existe déjà');
            process.exit(1);
        }

        // Hasher le mot de passe
        const hash = await bcrypt.hash(password, 10);

        // Créer l'administrateur
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role`,
            [name, email, hash, 'admin', true]
        );

        console.log('✅ Administrateur créé avec succès !');
        console.log('📧 Email:', result.rows[0].email);
        console.log('👤 Nom:', result.rows[0].name);
        console.log('🔑 Rôle:', result.rows[0].role);
        console.log('');
        console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors de la création de l\'administrateur:', err);
        process.exit(1);
    }
}

createAdmin();
