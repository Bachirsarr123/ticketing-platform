# 🚀 Guide de Déploiement

Ce guide explique comment déployer la plateforme de billetterie en production.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Backend](#déploiement-backend)
3. [Déploiement Frontend](#déploiement-frontend)
4. [Configuration Base de Données](#configuration-base-de-données)
5. [Variables d'Environnement](#variables-denvironnement)
6. [Vérifications Post-Déploiement](#vérifications-post-déploiement)

## ✅ Prérequis

- Compte GitHub (pour le code source)
- Compte Heroku, Railway, ou Render (pour le backend)
- Compte Vercel ou Netlify (pour le frontend)
- Base de données PostgreSQL (Heroku Postgres, Supabase, ou autre)

## 🔧 Déploiement Backend

### Option 1: Heroku

#### 1. Installer Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Créer l'application
```bash
cd backend
heroku create nom-de-votre-app
```

#### 3. Ajouter PostgreSQL
```bash
heroku addons:create heroku-postgresql:mini
```

#### 4. Configurer les variables d'environnement
```bash
heroku config:set JWT_SECRET=votre_secret_jwt_tres_securise
heroku config:set NODE_ENV=production
```

#### 5. Déployer
```bash
git push heroku main
```

#### 6. Initialiser la base de données
```bash
heroku pg:psql < schema.sql
```

### Option 2: Railway

#### 1. Créer un compte sur [railway.app](https://railway.app)

#### 2. Nouveau Projet
- Cliquer sur "New Project"
- Sélectionner "Deploy from GitHub repo"
- Choisir votre repository
- Sélectionner le dossier `backend`

#### 3. Ajouter PostgreSQL
- Cliquer sur "New"
- Sélectionner "Database" → "PostgreSQL"

#### 4. Variables d'Environnement
Dans les settings du service backend :
```
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=votre_secret_jwt
PORT=5000
NODE_ENV=production
```

#### 5. Déployer
Railway déploie automatiquement à chaque push sur GitHub.

### Option 3: Render

#### 1. Créer un compte sur [render.com](https://render.com)

#### 2. Nouveau Web Service
- New → Web Service
- Connecter votre repository GitHub
- Sélectionner le dossier `backend`

#### 3. Configuration
```
Build Command: npm install
Start Command: npm start
```

#### 4. Ajouter PostgreSQL
- New → PostgreSQL
- Copier l'URL de connexion

#### 5. Variables d'Environnement
```
DATABASE_URL=<url_postgresql>
JWT_SECRET=votre_secret_jwt
NODE_ENV=production
```

## 💻 Déploiement Frontend

### Option 1: Vercel (Recommandé)

#### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

#### 2. Déployer
```bash
cd frontend
vercel
```

#### 3. Configuration
Vercel détecte automatiquement Vite. Configurer les variables :
```
VITE_API_URL=https://votre-backend.herokuapp.com/api
```

#### 4. Déploiement Production
```bash
vercel --prod
```

### Option 2: Netlify

#### 1. Créer un compte sur [netlify.com](https://netlify.com)

#### 2. Nouveau Site
- Sites → Add new site → Import from Git
- Connecter GitHub
- Sélectionner le repository

#### 3. Build Settings
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

#### 4. Variables d'Environnement
Dans Site settings → Environment variables :
```
VITE_API_URL=https://votre-backend.herokuapp.com/api
```

### Option 3: GitHub Pages (Statique uniquement)

#### 1. Installer gh-pages
```bash
cd frontend
npm install --save-dev gh-pages
```

#### 2. Ajouter scripts dans package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. Configurer vite.config.js
```javascript
export default defineConfig({
  base: '/nom-du-repo/',
  // ...
})
```

#### 4. Déployer
```bash
npm run deploy
```

## 🗄️ Configuration Base de Données

### Heroku Postgres

#### Récupérer les credentials
```bash
heroku pg:credentials:url
```

#### Se connecter
```bash
heroku pg:psql
```

#### Importer le schéma
```bash
heroku pg:psql < schema.sql
```

### Supabase

#### 1. Créer un projet sur [supabase.com](https://supabase.com)

#### 2. Récupérer l'URL de connexion
Dans Settings → Database → Connection string

#### 3. Exécuter le schéma
Utiliser l'éditeur SQL de Supabase pour exécuter `schema.sql`

### PostgreSQL Externe

#### 1. Créer la base de données
```sql
CREATE DATABASE ticketing_db;
```

#### 2. Importer le schéma
```bash
psql -h hostname -U username -d ticketing_db -f schema.sql
```

## 🔐 Variables d'Environnement

### Backend (Production)

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_et_long

# Serveur
PORT=5000
NODE_ENV=production

# CORS (URL du frontend)
FRONTEND_URL=https://votre-frontend.vercel.app

# Stripe (si implémenté)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (si implémenté)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=votre_mot_de_passe_app
```

### Frontend (Production)

```env
# API Backend
VITE_API_URL=https://votre-backend.herokuapp.com/api

# Stripe (si implémenté)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

## ✅ Vérifications Post-Déploiement

### Checklist Backend

- [ ] Le serveur démarre sans erreur
- [ ] La base de données est accessible
- [ ] Les routes API répondent correctement
- [ ] L'authentification JWT fonctionne
- [ ] Les CORS sont correctement configurés
- [ ] Les logs sont accessibles

### Tests API
```bash
# Health check
curl https://votre-backend.herokuapp.com/health

# Test login
curl -X POST https://votre-backend.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Test événements publics
curl https://votre-backend.herokuapp.com/api/events/public
```

### Checklist Frontend

- [ ] L'application se charge correctement
- [ ] Les appels API fonctionnent
- [ ] L'authentification fonctionne
- [ ] Les événements s'affichent
- [ ] La réservation de billets fonctionne
- [ ] Le QR code s'affiche
- [ ] Le responsive fonctionne (mobile/desktop)

## 🔍 Monitoring et Logs

### Backend Logs

#### Heroku
```bash
heroku logs --tail
```

#### Railway
Accessible dans le dashboard Railway

#### Render
Accessible dans le dashboard Render

### Frontend Logs

#### Vercel
Accessible dans le dashboard Vercel → Deployments → Logs

#### Netlify
Accessible dans le dashboard Netlify → Deploys → Deploy log

## 🐛 Debugging Production

### Erreurs Communes

#### 1. CORS Error
**Symptôme**: Erreur CORS dans la console du navigateur

**Solution**: Vérifier la configuration CORS dans `server.js`
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### 2. Database Connection Error
**Symptôme**: Erreur de connexion à la base de données

**Solution**: Vérifier `DATABASE_URL` dans les variables d'environnement

#### 3. JWT Error
**Symptôme**: Erreur d'authentification

**Solution**: Vérifier que `JWT_SECRET` est identique entre tous les environnements

#### 4. 404 on Refresh
**Symptôme**: Page 404 lors du rafraîchissement (frontend)

**Solution**: Configurer les redirections (Vercel/Netlify)

**Vercel** - Créer `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - Créer `public/_redirects`:
```
/*  /index.html  200
```

## 🔄 CI/CD (Déploiement Continu)

### GitHub Actions

Créer `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "votre-app-backend"
          heroku_email: "votre@email.com"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## 📊 Performance

### Optimisations Backend
- Activer la compression gzip
- Mettre en cache les requêtes fréquentes
- Utiliser des index sur la base de données
- Limiter la taille des réponses

### Optimisations Frontend
- Minification automatique (Vite)
- Code splitting
- Lazy loading des images
- Service Worker (PWA)

## 🔒 Sécurité Production

### Checklist
- [ ] HTTPS activé (automatique sur Vercel/Netlify/Heroku)
- [ ] Variables d'environnement sécurisées
- [ ] JWT_SECRET fort et unique
- [ ] Rate limiting activé
- [ ] Validation des inputs
- [ ] Logs des erreurs (pas de données sensibles)
- [ ] Backup de la base de données configuré

## 💰 Coûts Estimés

### Gratuit (Tier Free)
- **Backend**: Heroku/Railway/Render (gratuit avec limitations)
- **Frontend**: Vercel/Netlify (gratuit)
- **Database**: Heroku Postgres mini (gratuit, 10k lignes max)
- **Total**: 0€/mois

### Production (Recommandé)
- **Backend**: Heroku Hobby ($7/mois) ou Railway ($5/mois)
- **Frontend**: Vercel Pro ($20/mois) ou Netlify Pro ($19/mois)
- **Database**: Heroku Standard ($50/mois) ou Supabase Pro ($25/mois)
- **Total**: ~$30-80/mois

## 📞 Support

En cas de problème :
1. Vérifier les logs
2. Consulter la documentation de la plateforme
3. Vérifier les variables d'environnement
4. Tester en local avec les mêmes variables

---

> [!TIP]
> Commencez avec les tiers gratuits pour tester, puis passez aux versions payantes selon vos besoins.
