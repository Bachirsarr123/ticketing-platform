# ✅ Compte Administrateur Papa - Prêt à Créer

## 🎯 Résumé

Tout est prêt pour créer votre compte administrateur !

**Identifiants :**
- 📧 Email : `Papa@gmail.com`
- 🔐 Mot de passe : `papa123`
- 👤 Rôle : Administrateur

---

## 🚀 CRÉATION DU COMPTE (2 minutes)

### Option 1 : Via psql (Recommandé)

```bash
# 1. Ouvrir psql
psql -U postgres -d ticketing_db

# 2. Exécuter le script
\i C:/Users/sbasarr200/ticketing-platform/backend/migrations/create-papa-admin.sql
```

### Option 2 : Copier-Coller Direct

**Ouvrir psql et coller :**

```sql
DELETE FROM users WHERE email = 'Papa@gmail.com';

INSERT INTO users (name, email, password_hash, role, is_active, created_at)
VALUES (
  'Papa Admin',
  'Papa@gmail.com',
  '$2b$10$Pb2kiX1zPrCtRkI78cTyx.DyqiHSwd9cWIJdY4kj9dAt1FEezpjlq',
  'admin',
  TRUE,
  NOW()
);

SELECT id, name, email, role FROM users WHERE email = 'Papa@gmail.com';
```

---

## ✅ CONNEXION

**1. Aller sur** : `http://localhost:5173/login`

**2. Se connecter avec :**
- Email : `Papa@gmail.com`
- Mot de passe : `papa123`

**3. Résultat attendu :**
- ✅ Redirection vers `/admin`
- ✅ Badge "ADMIN" dans la navbar
- ✅ Accès au dashboard admin complet

---

## 🎯 Fonctionnalités Disponibles

Une fois connecté, vous aurez accès à :

### 👥 Organisateurs
- Liste complète
- Activer/Désactiver
- Supprimer
- Statistiques

### 🎤 Événements
- Tous les événements
- Publier/Dépublier
- Supprimer
- Modifier

### 📊 Statistiques
- Métriques globales
- Top organisateurs
- Top événements
- Revenus totaux

---

**Consultez `CREATE_PAPA_ADMIN.md` pour le guide complet.**
