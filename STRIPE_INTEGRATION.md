# 💳 Guide d'Intégration Stripe

Ce document détaille le plan d'intégration de Stripe pour le système de paiement de la plateforme de billetterie.

> [!IMPORTANT]
> **Ce document est un guide de préparation.** L'intégration Stripe n'est PAS encore implémentée. Il s'agit d'un plan détaillé pour une future implémentation.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Flux de paiement](#flux-de-paiement)
3. [Configuration requise](#configuration-requise)
4. [Modifications Backend](#modifications-backend)
5. [Modifications Frontend](#modifications-frontend)
6. [Webhooks Stripe](#webhooks-stripe)
7. [Tests](#tests)
8. [Sécurité](#sécurité)
9. [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

### Objectif
Remplacer le système de réservation gratuite actuel par un système de paiement sécurisé via Stripe.

### Fonctionnalités
- ✅ Paiement par carte bancaire
- ✅ Confirmation par email avec QR code
- ✅ Gestion des remboursements
- ✅ Historique des transactions
- ✅ Mode test et production

## 🔄 Flux de Paiement

### Flux Actuel (Gratuit)
```
Visiteur → Sélectionne billet → Entre nom/téléphone → Reçoit QR code immédiatement
```

### Flux Futur (Avec Stripe)
```
1. Visiteur sélectionne un billet
2. Entre nom, téléphone et EMAIL
3. Clique sur "Payer"
4. Redirigé vers Stripe Checkout
5. Entre informations de paiement
6. Stripe traite le paiement
   ├─ Succès → Webhook notifie le backend
   │           → Backend crée le ticket
   │           → Email envoyé avec QR code
   │           → Redirection vers page de succès
   │
   └─ Échec  → Redirection vers page d'erreur
              → Possibilité de réessayer
```

## ⚙️ Configuration Requise

### 1. Compte Stripe
1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer les clés API :
   - **Clé publique** (pk_test_... ou pk_live_...)
   - **Clé secrète** (sk_test_... ou sk_live_...)
   - **Secret webhook** (whsec_...)

### 2. Variables d'Environnement

#### Backend (.env)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
STRIPE_SUCCESS_URL=http://localhost:5173/payment/success
STRIPE_CANCEL_URL=http://localhost:5173/payment/cancel

# Email Configuration (pour envoyer le QR code)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=votre_mot_de_passe
```

#### Frontend (.env)
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique
```

### 3. Dépendances à Installer

#### Backend
```bash
npm install stripe nodemailer
```

#### Frontend
```bash
npm install @stripe/stripe-js
```

## 🔧 Modifications Backend

### 1. Nouveau Contrôleur: `payment.controller.js`

```javascript
// backend/controllers/payment.controller.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');

// Créer une session Stripe Checkout
exports.createCheckoutSession = async (req, res) => {
  try {
    const { ticketTypeId, buyer_name, buyer_phone, buyer_email } = req.body;

    // Récupérer les infos du ticket
    const ticketType = await pool.query(
      'SELECT * FROM ticket_types WHERE id = $1',
      [ticketTypeId]
    );

    if (!ticketType.rows[0]) {
      return res.status(404).json({ message: 'Type de billet introuvable' });
    }

    const ticket = ticketType.rows[0];

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: ticket.name,
              description: `Billet pour l'événement`,
            },
            unit_amount: Math.round(ticket.price * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        ticketTypeId,
        buyer_name,
        buyer_phone,
        buyer_email,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session' });
  }
};

// Webhook Stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Créer le ticket dans la base de données
    await createTicketFromSession(session);
  }

  res.json({ received: true });
};

// Fonction helper pour créer le ticket
async function createTicketFromSession(session) {
  const { ticketTypeId, buyer_name, buyer_phone, buyer_email } = session.metadata;
  
  // TODO: Implémenter la création du ticket
  // TODO: Envoyer l'email avec le QR code
}
```

### 2. Nouvelles Routes: `payment.routes.js`

```javascript
// backend/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Créer une session de paiement
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Webhook Stripe (pas d'auth, Stripe l'appelle directement)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
```

### 3. Modifications de la Base de Données

```sql
-- Ajouter des colonnes à la table tickets
ALTER TABLE tickets
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN stripe_payment_id VARCHAR(255),
ADD COLUMN buyer_email VARCHAR(255);

-- Index pour recherche rapide
CREATE INDEX idx_tickets_payment_status ON tickets(payment_status);
CREATE INDEX idx_tickets_stripe_payment_id ON tickets(stripe_payment_id);
```

### 4. Service Email: `email.service.js`

```javascript
// backend/services/email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendTicketEmail = async (email, ticketData, qrCode) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Votre billet - Confirmation',
    html: `
      <h1>Votre billet est confirmé !</h1>
      <p>Bonjour ${ticketData.buyer_name},</p>
      <p>Votre paiement a été confirmé. Voici votre QR code :</p>
      <img src="${qrCode}" alt="QR Code" />
      <p>Token: ${ticketData.qr_token}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
```

## 💻 Modifications Frontend

### 1. Modifications: `Events.jsx`

```javascript
// Ajouter le champ email au formulaire
const [buyerEmail, setBuyerEmail] = useState('');

// Nouvelle fonction pour initier le paiement
const initiateCheckout = async (ticketType) => {
  const buyer_name = prompt("Votre nom complet ?");
  const buyer_phone = prompt("Votre numéro de téléphone ?");
  const buyer_email = prompt("Votre email ?");

  if (!buyer_name || !buyer_phone || !buyer_email) {
    alert("Tous les champs sont obligatoires");
    return;
  }

  try {
    const response = await paymentAPI.createCheckoutSession({
      ticketTypeId: ticketType.id,
      buyer_name,
      buyer_phone,
      buyer_email,
    });

    // Rediriger vers Stripe Checkout
    window.location.href = response.data.url;
  } catch (err) {
    alert("Erreur lors de l'initialisation du paiement");
  }
};
```

### 2. Nouvelle Page: `PaymentSuccess.jsx`

```javascript
// frontend/src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    // Récupérer les détails du ticket
    // TODO: Implémenter l'appel API
  }, [sessionId]);

  return (
    <div className="container">
      <h1>✅ Paiement Réussi !</h1>
      <p>Votre billet a été envoyé par email.</p>
      {/* Afficher le QR code */}
    </div>
  );
}

export default PaymentSuccess;
```

### 3. Nouvelle Page: `PaymentCancel.jsx`

```javascript
// frontend/src/pages/PaymentCancel.jsx
function PaymentCancel() {
  return (
    <div className="container">
      <h1>❌ Paiement Annulé</h1>
      <p>Votre paiement a été annulé. Aucun montant n'a été débité.</p>
      <button onClick={() => window.history.back()}>
        Réessayer
      </button>
    </div>
  );
}

export default PaymentCancel;
```

### 4. Nouveau Service API: `api.js`

```javascript
// Ajouter au fichier api.js existant
export const paymentAPI = {
  createCheckoutSession: (data) => apiClient.post('/payment/create-checkout-session', data),
};
```

## 🔔 Webhooks Stripe

### Configuration
1. Aller dans le Dashboard Stripe
2. Developers → Webhooks
3. Ajouter un endpoint : `https://votre-domaine.com/api/payment/webhook`
4. Sélectionner les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Événements à Gérer

```javascript
switch (event.type) {
  case 'checkout.session.completed':
    // Créer le ticket
    break;
  case 'payment_intent.succeeded':
    // Confirmer le paiement
    break;
  case 'payment_intent.payment_failed':
    // Notifier l'échec
    break;
}
```

## 🧪 Tests

### Mode Test Stripe
Utiliser les cartes de test Stripe :

| Carte | Résultat |
|-------|----------|
| 4242 4242 4242 4242 | Succès |
| 4000 0000 0000 0002 | Échec |
| 4000 0025 0000 3155 | Authentification 3D Secure |

### Tests à Effectuer
1. ✅ Paiement réussi
2. ✅ Paiement échoué
3. ✅ Paiement annulé
4. ✅ Webhook reçu et traité
5. ✅ Email envoyé avec QR code
6. ✅ Ticket créé dans la DB

## 🔒 Sécurité

### Bonnes Pratiques
- ✅ Ne JAMAIS exposer la clé secrète Stripe côté client
- ✅ Valider la signature des webhooks
- ✅ Utiliser HTTPS en production
- ✅ Vérifier les montants côté serveur
- ✅ Logger tous les paiements
- ✅ Gérer les erreurs proprement

### Validation Webhook
```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## 🚀 Déploiement

### Checklist Production
- [ ] Remplacer les clés test par les clés live
- [ ] Configurer le webhook en production
- [ ] Tester avec de vraies cartes (petits montants)
- [ ] Configurer les emails de production
- [ ] Activer les logs Stripe
- [ ] Configurer les alertes d'erreur

### Variables d'Environnement Production
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://votre-domaine.com/payment/success
STRIPE_CANCEL_URL=https://votre-domaine.com/payment/cancel
```

## 📊 Monitoring

### Métriques à Suivre
- Taux de conversion (sessions créées vs paiements réussis)
- Montant total des transactions
- Taux d'échec des paiements
- Temps moyen de paiement

### Dashboard Stripe
Utiliser le dashboard Stripe pour :
- Voir toutes les transactions
- Gérer les remboursements
- Analyser les performances
- Détecter les fraudes

## 🔄 Migration du Système Actuel

### Étapes
1. Implémenter le système Stripe en parallèle
2. Tester en mode test
3. Basculer progressivement (feature flag)
4. Garder l'ancien système en backup
5. Migrer complètement après validation

### Compatibilité
Le système actuel (gratuit) peut coexister avec Stripe :
- Ajouter un champ `is_free` aux événements
- Si `is_free = true`, utiliser l'ancien flux
- Si `is_free = false`, utiliser Stripe

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Cartes de test](https://stripe.com/docs/testing)

---

> [!NOTE]
> Ce document sera mis à jour au fur et à mesure de l'implémentation réelle.
