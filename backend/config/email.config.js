const nodemailer = require('nodemailer');

/**
 * Configuration du service email avec Nodemailer
 */

// Créer le transporteur SMTP
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App Password Gmail
    },
    // Force l'utilisation d'IPv4 pour éviter les problèmes de réseau sur Render/Docker
    family: 4,
});

// Vérifier la connexion
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erreur configuration email:', error);
    } else {
        console.log('✅ Service email prêt');
    }
});

module.exports = transporter;
