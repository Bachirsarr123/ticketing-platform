# 🎟️ Ticketing Platform

Une plateforme moderne de billetterie pour événements, permettant aux organisateurs de créer et gérer leurs événements, et aux visiteurs de réserver des billets facilement.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Fonctionnalités Principales

### Pour les Visiteurs
- 🎉 **Navigation des événements** - Parcourir tous les événements disponibles
- 🎫 **Réservation anonyme** - Réserver des billets sans créer de compte
- 📱 **QR Code** - Recevoir un QR code unique pour chaque billet
- 💳 **Plusieurs types de billets** - Choisir parmi différentes catégories (VIP, Standard, Étudiant, etc.)

### Pour les Organisateurs
- 📊 **Dashboard complet** - Vue d'ensemble de tous vos événements
- ➕ **Création d'événements** - Créer et gérer vos événements facilement
- 🎟️ **Gestion des billets** - Définir plusieurs types de billets avec prix et quantités
- 📢 **Publication** - Publier vos événements quand vous êtes prêt
- 📱 **Scanner de billets** - Valider les billets à l'entrée via QR code

### Pour les Administrateurs *(à venir)*
- 👥 **Gestion des utilisateurs** - Gérer les organisateurs
- 📈 **Statistiques globales** - Vue d'ensemble de la plateforme
- 🔧 **Modération** - Approuver et modérer les événements

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **bcrypt** - Hachage des mots de passe
- **QRCode** - Génération de QR codes

### Frontend
- **React** - Bibliothèque UI
- **Vite** - Build tool moderne
- **React Router** - Navigation
- **Axios** - Client HTTP
- **CSS Variables** - Design system moderne

## 📦 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd ticketing-platform
```

### 2. Configuration Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à la racine du dossier backend :
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticketing_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_tres_securise
```

Créer la base de données :
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE ticketing_db;

# Quitter psql
\q

# Importer le schéma
psql -U postgres -d ticketing_db -f schema.sql
```

Démarrer le serveur :
```bash
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

### 3. Configuration Frontend

```bash
cd frontend
npm install
```

Créer un fichier `.env` à la racine du dossier frontend :
```env
VITE_API_URL=http://localhost:5000/api
```

Démarrer l'application :
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 🚀 Utilisation

### 1. Créer un compte organisateur
1. Accédez à l'application
2. Cliquez sur "Inscription"
3. Remplissez le formulaire avec vos informations
4. Choisissez le rôle "Organisateur"

### 2. Créer un événement
1. Connectez-vous avec votre compte
2. Accédez au Dashboard
3. Cliquez sur "Créer un événement"
4. Remplissez les informations (titre, description, lieu, date)

### 3. Ajouter des types de billets
1. Dans votre dashboard, trouvez votre événement
2. Cliquez sur "Ajouter un ticket"
3. Définissez le nom, prix et quantité
4. Créez autant de types que nécessaire (VIP, Standard, etc.)

### 4. Publier l'événement
1. Une fois les billets ajoutés, cliquez sur "Publier"
2. L'événement sera visible sur la page publique

### 5. Réserver un billet (visiteur)
1. Accédez à la page "Événements"
2. Sélectionnez un événement
3. Cliquez sur "Voir les billets disponibles"
4. Choisissez un type de billet
5. Entrez votre nom et téléphone
6. Recevez votre QR code

### 6. Scanner les billets
1. Connectez-vous en tant qu'organisateur
2. Accédez au "Scanner"
3. Collez le token du QR code
4. Validez l'accès du participant

## 👥 Rôles Utilisateurs

### Visiteur (Anonyme)
- Peut voir tous les événements publiés
- Peut réserver des billets sans compte
- Reçoit un QR code par billet

### Organisateur (Authentifié)
- Peut créer des événements
- Peut gérer ses propres événements
- Peut créer des types de billets
- Peut publier ses événements
- Peut scanner les billets à l'entrée

### Admin (Authentifié) *(à venir)*
- Tous les droits organisateur
- Peut gérer tous les événements
- Peut gérer les utilisateurs
- Accès aux statistiques globales

## 📊 Structure de la Base de Données

### Tables principales
- **users** - Utilisateurs (organisateurs, admins)
- **events** - Événements créés
- **ticket_types** - Types de billets par événement
- **tickets** - Billets réservés avec QR codes

Voir `backend/schema.sql` pour le schéma complet.

## 🔐 Sécurité

- ✅ Mots de passe hachés avec bcrypt
- ✅ Authentification JWT
- ✅ Variables d'environnement pour les secrets
- ✅ Protection CORS configurée
- ✅ Validation des données côté serveur
- ✅ Routes protégées par middleware

## 🔮 Améliorations Futures

### Phase 1 - Paiement
- [ ] Intégration Stripe pour paiements sécurisés
- [ ] Gestion des remboursements
- [ ] Historique des transactions

### Phase 2 - Notifications
- [ ] Emails de confirmation
- [ ] Rappels avant événement
- [ ] Notifications pour organisateurs

### Phase 3 - Fonctionnalités Avancées
- [ ] Dashboard admin complet
- [ ] Upload d'images pour événements
- [ ] Catégories et tags
- [ ] Recherche et filtres avancés
- [ ] Statistiques et analytics
- [ ] Export de données (CSV, PDF)

### Phase 4 - UX
- [ ] Scanner QR avec caméra (WebRTC)
- [ ] Mode hors-ligne pour scanner
- [ ] Application mobile (React Native)
- [ ] Multi-langue (i18n)
- [ ] Mode sombre

### Phase 5 - Performance
- [ ] Cache Redis
- [ ] CDN pour assets
- [ ] Optimisation images
- [ ] Service Worker (PWA)

## 📚 Documentation Complémentaire

- [Backend README](backend/README.md) - Documentation API détaillée
- [Frontend README](frontend/README.md) - Documentation composants
- [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) - Guide d'intégration Stripe
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour faciliter la gestion d'événements

## 🐛 Signaler un Bug

Si vous trouvez un bug, veuillez ouvrir une issue avec :
- Description du problème
- Étapes pour reproduire
- Comportement attendu vs actuel
- Captures d'écran si applicable

## 💬 Support

Pour toute question ou support, contactez-nous ou ouvrez une issue sur GitHub.

---

**Note**: Ce projet est en développement actif. Les fonctionnalités peuvent évoluer.
