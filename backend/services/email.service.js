const transporter = require('../config/email.config');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service d'envoi d'emails
 */

class EmailService {
  /**
   * Envoyer email de confirmation de billet
   */
  async sendTicketConfirmation({ to, ticket, event, ticketType, organizerName }) {
    try {
      console.log('📧 Envoi email confirmation à:', to);

      // Générer QR Code en buffer
      const qrData = `TICKET:${ticket.qr_token}`;
      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        width: 300,
        margin: 2,
      });

      // Formater la date
      const eventDate = new Date(event.date_event);
      const formattedDate = eventDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Template HTML
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .event-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .event-info h2 {
      margin: 0 0 15px 0;
      color: #1f2937;
      font-size: 24px;
    }
    .info-row {
      margin: 10px 0;
      color: #4b5563;
      font-size: 16px;
    }
    .ticket-details {
      background: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      margin-bottom: 20px;
    }
    .qr-section {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      margin: 20px 0;
    }
    .qr-section img {
      max-width: 250px;
      margin: 10px auto;
    }
    .footer {
      background: #f3f4f6;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 10px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Votre billet est confirmé !</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #4b5563;">
        Bonjour <strong>${ticket.buyer_name}</strong>,
      </p>
      <p style="font-size: 16px; color: #4b5563;">
        Votre réservation a été confirmée avec succès. Vous trouverez ci-dessous tous les détails de votre billet.
      </p>
      
      <div class="event-info">
        <h2>${event.title}</h2>
        <div class="info-row">📍 <strong>Lieu :</strong> ${event.location}</div>
        <div class="info-row">📅 <strong>Date :</strong> ${formattedDate}</div>
        <div class="info-row">🕐 <strong>Heure :</strong> ${formattedTime}</div>
      </div>
      
      <div class="ticket-details">
        <h3 style="margin-top: 0; color: #667eea;">Détails de votre billet</h3>
        <div class="info-row">🎟 <strong>Type :</strong> ${ticketType.name}</div>
        <div class="info-row">👤 <strong>Nom :</strong> ${ticket.buyer_name}</div>
        <div class="info-row">📞 <strong>Téléphone :</strong> ${ticket.buyer_phone}</div>
        <div class="info-row">💰 <strong>Prix :</strong> ${ticketType.price} €</div>
        <div class="info-row" style="font-family: monospace; font-size: 12px; color: #6b7280;">
          🆔 <strong>ID :</strong> ${ticket.qr_token}
        </div>
      </div>
      
      <div class="qr-section">
        <h3 style="color: #667eea;">QR Code d'entrée</h3>
        <img src="cid:qrcode" alt="QR Code" />
        <p style="color: #6b7280; margin: 10px 0;">
          📱 Présentez ce QR code à l'entrée de l'événement
        </p>
      </div>
      
      <p style="text-align: center; color: #6b7280;">
        Votre billet complet est également disponible en pièce jointe.
      </p>
    </div>
    
    <div class="footer">
      <p>Organisé par <strong>${organizerName || 'TicketPro'}</strong></p>
      <p>Plateforme TicketPro - Billetterie en ligne</p>
      <p style="font-size: 12px; color: #9ca3af;">
        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
      </p>
    </div>
  </div>
</body>
</html>
      `;

      // Options de l'email
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"TicketPro" <noreply@ticketpro.com>',
        to: to,
        subject: `🎫 Votre billet pour ${event.title}`,
        html: htmlContent,
        attachments: [
          {
            filename: 'qrcode.png',
            content: qrCodeBuffer,
            cid: 'qrcode', // Content ID pour référence dans HTML
          },
        ],
      };

      // Envoyer l'email
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé:', info.messageId);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw error;
    }
  }

  /**
   * Envoyer rappel d'événement (24h avant)
   */
  async sendEventReminder({ to, ticket, event }) {
    try {
      console.log('📧 Envoi rappel événement à:', to);

      const eventDate = new Date(event.date_event);
      const formattedDate = eventDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    h1 { margin: 0; }
    .content { padding: 20px 0; }
    .info { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Rappel : Votre événement est demain !</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${ticket.buyer_name}</strong>,</p>
      <p>Nous vous rappelons que l'événement suivant aura lieu <strong>demain</strong> :</p>
      <div class="info">
        <h2>${event.title}</h2>
        <p>📍 ${event.location}</p>
        <p>📅 ${formattedDate}</p>
        <p>🕐 ${formattedTime}</p>
      </div>
      <p>N'oubliez pas d'apporter votre billet (QR code) !</p>
      <p style="color: #6b7280; font-size: 14px;">À très bientôt ! 🎉</p>
    </div>
  </div>
</body>
</html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"TicketPro" <noreply@ticketpro.com>',
        to: to,
        subject: `⏰ Rappel : ${event.title} - Demain !`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Rappel envoyé:', info.messageId);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi rappel:', error);
      throw error;
    }
  }

  /**
   * Notifier l'organisateur d'un scan
   */
  async sendScanNotification({ to, ticket, event, scanTime }) {
    try {
      console.log('📧 Envoi notification scan à:', to);

      const scanDate = new Date(scanTime);
      const formattedScanTime = scanDate.toLocaleString('fr-FR');

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .info { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Billet scanné avec succès</h1>
    </div>
    <div class="content">
      <p>Un participant vient d'arriver à votre événement :</p>
      <div class="info">
        <h3>${event.title}</h3>
        <p><strong>Participant :</strong> ${ticket.buyer_name}</p>
        <p><strong>Téléphone :</strong> ${ticket.buyer_phone}</p>
        <p><strong>Type de billet :</strong> ${ticket.ticket_type_name}</p>
        <p><strong>Heure de scan :</strong> ${formattedScanTime}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Notification automatique - TicketPro</p>
    </div>
  </div>
</body>
</html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"TicketPro" <noreply@ticketpro.com>',
        to: to,
        subject: `✅ Nouveau participant - ${event.title}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Notification scan envoyée:', info.messageId);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur notification scan:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
