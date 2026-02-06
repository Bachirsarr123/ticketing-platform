require('dotenv').config();
const bcrypt = require('bcrypt');

/**
 * Générateur de hash bcrypt pour le mot de passe
 * Usage: node backend/scripts/generate-password-hash.js
 */

async function generateHash() {
    const password = 'papa123';

    try {
        const hash = await bcrypt.hash(password, 10);

        console.log('');
        console.log('🔐 Hash généré pour le mot de passe: papa123');
        console.log('');
        console.log('Hash bcrypt:');
        console.log(hash);
        console.log('');
        console.log('📋 Copiez ce hash et utilisez-le dans la requête SQL suivante:');
        console.log('');
        console.log(`INSERT INTO users (name, email, password_hash, role, is_active, created_at)`);
        console.log(`VALUES (`);
        console.log(`  'Papa Admin',`);
        console.log(`  'Papa@gmail.com',`);
        console.log(`  '${hash}',`);
        console.log(`  'admin',`);
        console.log(`  TRUE,`);
        console.log(`  NOW()`);
        console.log(`);`);
        console.log('');

    } catch (err) {
        console.error('❌ Erreur:', err);
    }
}

generateHash();
