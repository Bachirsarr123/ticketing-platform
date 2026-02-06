const bcrypt = require('bcrypt');
const pool = require('../db');

/**
 * Script pour créer l'administrateur Papa
 * Email: Papa@gmail.com
 * Password: papa123
 */

async function createPapaAdmin() {
    try {
        const name = 'Papa Admin';
        const email = 'Papa@gmail.com';
        const password = 'papa123';

        console.log('🔐 Création du compte administrateur Papa...');

        // Vérifier si l'email existe déjà
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rowCount > 0) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà');
            console.log('Suppression de l\'ancien compte...');
            await pool.query('DELETE FROM users WHERE email = $1', [email]);
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
        console.log('');
        console.log('📧 Email:', result.rows[0].email);
        console.log('👤 Nom:', result.rows[0].name);
        console.log('🔑 Rôle:', result.rows[0].role);
        console.log('🔐 Mot de passe:', password);
        console.log('');
        console.log('✅ Vous pouvez maintenant vous connecter avec ces identifiants');

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors de la création de l\'administrateur:', err);
        process.exit(1);
    }
}

createPapaAdmin();
