# 🔐 Guide de Configuration Admin

## 📋 Résumé

Le système d'administration est **100% implémenté**. Il ne reste que 3 étapes simples pour le mettre en service.

---

## ✅ Ce Qui Est Prêt

### Backend
- ✅ Contrôleur admin (`admin.controller.js`)
- ✅ Routes admin (`admin.routes.js`)
- ✅ Middleware `authorizeAdmin`
- ✅ Endpoints pour gestion organisateurs, événements, et stats

### Frontend
- ✅ Dashboard admin (`AdminDashboard.jsx`)
- ✅ Gestion organisateurs (activer/désactiver/supprimer)
- ✅ Gestion événements (publier/dépublier/supprimer)
- ✅ Statistiques globales et analytics
- ✅ Navigation conditionnelle (Admin vs Organisateur)
- ✅ Protection par rôle (PrivateRoute)

### Sécurité
- ✅ Aucune inscription admin via interface
- ✅ Rôle "organizer" fixé dans Register
- ✅ Contrôle d'accès strict sur toutes les routes admin

---

## 🚀 ÉTAPES DE MISE EN SERVICE

### Étape 1️⃣ : Migration Base de Données

**Ajouter la colonne `is_active` pour activer/désactiver les organisateurs**

```bash
# Ouvrir psql
psql -U postgres -d ticketing_db
```

```sql
-- Exécuter la migration
\i C:/Users/sbasarr200/ticketing-platform/backend/migrations/add_admin_features.sql
```

**OU** copier-coller directement :

```sql
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_role ON users(role);
```

**Vérification :**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_active';
```

✅ Résultat attendu : `is_active | boolean | true`

---

### Étape 2️⃣ : Créer un Administrateur

**Option A - Via Script Node.js (Recommandé)**

1. Ouvrir `backend/scripts/create-admin.js`
2. Modifier les valeurs :
   ```javascript
   const name = 'Votre Nom';
   const email = 'admin@ticketing.com';
   const password = 'VotreMotDePasse123!';
   ```

3. Exécuter :
   ```bash
   node backend/scripts/create-admin.js
   ```

**Option B - Via SQL Direct**

```sql
-- Remplacer les valeurs
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
  'Super Admin',
  'admin@ticketing.com',
  '$2b$10$...',  -- Hash bcrypt du mot de passe
  'admin',
  TRUE
);
```

⚠️ **Note** : Pour Option B, vous devez générer le hash bcrypt du mot de passe.

---

### Étape 3️⃣ : Tester le Dashboard Admin

1. **Redémarrer le backend** (si pas déjà fait)
   ```bash
   npm run dev
   ```

2. **Rafraîchir le frontend** (Ctrl+F5)

3. **Se connecter avec le compte admin**
   - Email : `admin@ticketing.com`
   - Mot de passe : celui que vous avez défini

4. **Vérifier la navbar**
   - Badge "ADMIN" visible
   - Bouton "🔐 Admin" au lieu de "📊 Dashboard"

5. **Accéder au dashboard admin**
   - Cliquer sur "🔐 Admin"
   - Vous devriez voir 3 onglets :
     - 👥 Organisateurs
     - 🎤 Événements
     - 📊 Statistiques

---

## 🎯 Fonctionnalités Admin

### 👥 Gestion Organisateurs

**Voir :**
- Liste complète des organisateurs
- Nombre d'événements par organisateur
- Nombre de billets vendus
- Revenus générés

**Actions :**
- ✅ **Activer/Désactiver** un organisateur
- ❌ **Supprimer** un organisateur (supprime aussi ses événements)

---

### 🎤 Gestion Événements

**Voir :**
- Tous les événements de tous les organisateurs
- Statut (Publié/Brouillon)
- Nombre de billets vendus

**Actions :**
- ✅ **Publier/Dépublier** n'importe quel événement
- ❌ **Supprimer** un événement (si aucun billet vendu)

---

### 📊 Statistiques

**Métriques Globales :**
- Total organisateurs
- Total événements
- Total billets vendus
- Revenus totaux

**Top Classements :**
- Top 5 organisateurs (par billets vendus)
- Top 5 événements (par popularité)

---

## 🔒 Sécurité & Contrôles

### Protection des Routes

**Backend :**
```javascript
// Toutes les routes /api/admin/* nécessitent :
1. Token JWT valide (authenticate)
2. Rôle = 'admin' (authorizeAdmin)
```

**Frontend :**
```javascript
// Route /admin protégée par :
<PrivateRoute allowedRoles={['admin']}>
  <AdminDashboard />
</PrivateRoute>
```

### Tentatives d'Accès Non Autorisées

**Organisateur tente d'accéder à /admin :**
- ❌ Redirection automatique vers `/dashboard`

**Utilisateur non connecté :**
- ❌ Redirection vers `/login`

**Organisateur tente d'appeler API admin :**
- ❌ Erreur 403 "Accès réservé aux administrateurs"

---

## 🧪 Tests à Effectuer

### Test 1 : Connexion Admin
```
1. Se connecter comme admin
2. Vérifier badge "ADMIN" dans navbar
3. Vérifier bouton "🔐 Admin"
4. Cliquer → Dashboard admin s'affiche
```

### Test 2 : Gestion Organisateurs
```
1. Onglet "Organisateurs"
2. Voir liste des organisateurs
3. Cliquer "Désactiver" sur un organisateur
4. Vérifier changement de statut
5. Cliquer "Activer" → Retour à actif
```

### Test 3 : Gestion Événements
```
1. Onglet "Événements"
2. Voir tous les événements
3. Cliquer "Dépublier" sur un événement publié
4. Vérifier changement de statut
5. Cliquer "Publier" → Retour à publié
```

### Test 4 : Statistiques
```
1. Onglet "Statistiques"
2. Vérifier cartes de métriques
3. Vérifier top organisateurs
4. Vérifier top événements
```

### Test 5 : Sécurité
```
1. Se déconnecter
2. Se connecter comme organisateur
3. Tenter d'accéder à /admin
4. Vérifier redirection vers /dashboard
```

---

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers Backend
- `controllers/admin.controller.js` - Logique admin
- `routes/admin.routes.js` - Routes admin
- `migrations/add_admin_features.sql` - Migration DB
- `scripts/create-admin.js` - Script création admin

### Nouveaux Fichiers Frontend
- `pages/AdminDashboard.jsx` - Dashboard admin

### Fichiers Modifiés Backend
- `middlewares/auth.middleware.js` - Ajout `authorizeAdmin`
- `server.js` - Enregistrement routes admin

### Fichiers Modifiés Frontend
- `api/api.js` - Ajout endpoints admin
- `App.jsx` - Ajout route `/admin`
- `components/PrivateRoute.jsx` - Support `allowedRoles`
- `components/Navbar.jsx` - Lien conditionnel admin

---

## ⚠️ Notes Importantes

### Suppression d'Organisateur
- ⚠️ Supprime **TOUS** ses événements et billets (CASCADE)
- ⚠️ Action **IRRÉVERSIBLE**
- ✅ Confirmation requise

### Suppression d'Événement
- ❌ **Impossible** si des billets ont été vendus
- ✅ Message d'erreur explicite avec nombre de billets

### Mot de Passe Admin
- 🔐 Changez le mot de passe par défaut après première connexion
- 🔐 Utilisez un mot de passe fort (min. 8 caractères, majuscules, chiffres, symboles)

---

## 🎉 Résultat Final

Une fois les 3 étapes complétées, vous aurez :

✅ **Dashboard Admin Complet**
- Gestion totale des organisateurs
- Gestion totale des événements
- Analytics et statistiques détaillées

✅ **Sécurité Renforcée**
- Aucune inscription admin via interface
- Contrôle d'accès strict par rôle
- Protection de toutes les routes sensibles

✅ **Séparation des Rôles**
- Admin : Gestion globale
- Organisateur : Gestion de ses propres événements
- Visiteur : Réservation publique

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs backend
2. Vérifier la console frontend (F12)
3. Vérifier que la migration DB est bien exécutée
4. Vérifier que l'admin est bien créé avec rôle 'admin'

**Temps total estimé : 10 minutes**
