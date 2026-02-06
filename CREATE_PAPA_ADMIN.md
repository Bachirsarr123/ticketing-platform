# 🔐 Création du Compte Administrateur Papa

## 📋 Informations du Compte

- **Email**: `Papa@gmail.com`
- **Mot de passe**: `papa123`
- **Rôle**: Administrateur
- **Accès**: Dashboard Admin complet

---

## 🚀 ÉTAPES DE CRÉATION

### Méthode 1 : Via psql (Recommandé)

**1. Ouvrir psql**
```bash
psql -U postgres -d ticketing_db
```

**2. Exécuter le script SQL**
```sql
\i C:/Users/sbasarr200/ticketing-platform/backend/migrations/create-papa-admin.sql
```

**3. Vérifier la création**
Vous devriez voir :
```
DELETE 0 (ou 1 si l'utilisateur existait)
INSERT 0 1
```

Puis les informations du compte créé.

---

### Méthode 2 : Copier-Coller SQL

**Ouvrir psql et coller directement :**

```sql
-- Supprimer l'utilisateur s'il existe déjà
DELETE FROM users WHERE email = 'Papa@gmail.com';

-- Créer le compte administrateur
INSERT INTO users (name, email, password_hash, role, is_active, created_at)
VALUES (
  'Papa Admin',
  'Papa@gmail.com',
  '$2b$10$Pb2kiX1zPrCtRkI78cTyx.DyqiHSwd9cWIJdY4kj9dAt1FEezpjlq',
  'admin',
  TRUE,
  NOW()
);

-- Vérifier
SELECT id, name, email, role, is_active FROM users WHERE email = 'Papa@gmail.com';
```

---

## ✅ CONNEXION

**1. Aller sur la page de connexion**
```
http://localhost:5173/login
```

**2. Se connecter avec :**
- **Email**: `Papa@gmail.com`
- **Mot de passe**: `papa123`

**3. Vérification après connexion :**
- ✅ Redirection automatique vers `/admin`
- ✅ Badge "ADMIN" visible dans la navbar
- ✅ Bouton "🔐 Admin" au lieu de "📊 Dashboard"

---

## 🎯 ACCÈS AU DASHBOARD ADMIN

Une fois connecté, vous aurez accès à :

### 👥 Gestion des Organisateurs
- Voir tous les organisateurs
- Activer/Désactiver un organisateur
- Supprimer un organisateur
- Voir statistiques par organisateur

### 🎤 Gestion des Événements
- Voir tous les événements
- Publier/Dépublier un événement
- Supprimer un événement
- Modifier n'importe quel événement

### 📊 Statistiques Globales
- Total organisateurs
- Total événements
- Total billets vendus
- Revenus totaux
- Top organisateurs
- Top événements

---

## 🔒 Sécurité

✅ **Compte créé manuellement en base de données**
✅ **Impossible de créer via l'interface d'inscription**
✅ **Mot de passe hashé avec bcrypt (10 rounds)**
✅ **Accès complet au dashboard admin**

---

## ⚠️ IMPORTANT

**Changez le mot de passe après la première connexion !**

Pour changer le mot de passe, vous pouvez :
1. Générer un nouveau hash avec le script
2. Mettre à jour en base de données

```bash
# Générer un nouveau hash
node backend/scripts/generate-password-hash.js
# (Modifier le mot de passe dans le script d'abord)
```

Puis en SQL :
```sql
UPDATE users 
SET password_hash = 'NOUVEAU_HASH_ICI' 
WHERE email = 'Papa@gmail.com';
```

---

## 🧪 Test Complet

**1. Créer le compte** (via SQL ci-dessus)
**2. Se connecter** (Papa@gmail.com / papa123)
**3. Vérifier redirection** → `/admin`
**4. Tester onglet Organisateurs** → Voir la liste
**5. Tester onglet Événements** → Voir tous les événements
**6. Tester onglet Statistiques** → Voir les métriques

---

## ✅ Résultat Attendu

Après création et connexion :
- Badge "ADMIN" dans la navbar
- Accès au dashboard admin complet
- Gestion totale de la plateforme
- Statistiques en temps réel

**Temps estimé : 2 minutes**
