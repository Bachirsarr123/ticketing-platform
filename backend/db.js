const { Pool } = require('pg');
require('dotenv').config();

// ===============================================
// CONFIGURATION POSTGRESQL / SUPABASE
// ===============================================
// Support pour DATABASE_URL (Supabase, Render, Heroku)
// OU variables individuelles (développement local)

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
      // Production: Utilise DATABASE_URL (format Supabase/Render/Heroku)
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
    : {
      // Développement: Utilise les variables individuelles
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
);

// ===============================================
// GESTION DES ERREURS DE CONNEXION
// ===============================================
pool.on('error', (err, client) => {
  console.error('❌ Erreur inattendue de la base de données:', err);
  process.exit(-1);
});

// ===============================================
// TEST DE CONNEXION AU DÉMARRAGE
// ===============================================
pool.on('connect', () => {
  console.log('✅ Nouvelle connexion PostgreSQL établie');
});

module.exports = pool;
