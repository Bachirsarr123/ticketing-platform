# 🔧 Guide de Débogage - Billets Organisateur

## Problème Identifié

**Symptôme:** Dashboard organisateur affiche 0 billets alors que des billets ont été réservés.

## Corrections Apportées

### 1. Logs de Débogage Ajoutés

#### Backend (`ticket.controller.js`)
```javascript
console.log('🎫 Récupération billets pour organisateur ID:', organizerId);
console.log(`✅ ${result.rows.length} billet(s) trouvé(s)`);
```

#### Frontend (`OrganizerDashboard.jsx`)
```javascript
console.log("🎫 Chargement des billets...");
console.log("✅ Billets reçus:", response.data);
console.error("❌ Error loading tickets:", err);
```

### 2. Bouton Rafraîchir Ajouté

Un bouton "🔄 Rafraîchir" permet de recharger manuellement les billets.

## Comment Déboguer

### Étape 1: Vérifier la Console Backend

1. Ouvrir le terminal du backend
2. Réserver un billet côté utilisateur
3. Se connecter au dashboard organisateur
4. Observer les logs:

```
🎫 Récupération billets pour organisateur ID: 1
✅ 5 billet(s) trouvé(s)
```

**Si 0 billets trouvés:**
- Vérifier que `organizer_id` dans la table `events` correspond bien à l'ID de l'utilisateur connecté
- Vérifier que les billets sont bien liés aux événements via `event_id`

### Étape 2: Vérifier la Console Frontend

1. Ouvrir DevTools (F12)
2. Onglet Console
3. Observer les logs:

```
🎫 Chargement des billets...
✅ Billets reçus: [{...}, {...}]
```

**Si erreur:**
- Vérifier le message d'erreur
- Vérifier l'authentification (token JWT)

### Étape 3: Vérifier la Base de Données

```sql
-- Vérifier les événements de l'organisateur
SELECT id, title, organizer_id FROM events WHERE organizer_id = 1;

-- Vérifier les billets pour ces événements
SELECT t.*, e.title, e.organizer_id 
FROM tickets t
JOIN events e ON t.event_id = e.id
WHERE e.organizer_id = 1;
```

## Causes Possibles

### 1. Problème d'Authentification
- Token JWT expiré ou invalide
- `req.user.id` undefined

**Solution:** Vérifier les logs backend pour `organizerId`

### 2. Problème de Données
- `organizer_id` dans `events` ne correspond pas
- `event_id` dans `tickets` incorrect

**Solution:** Vérifier les données en DB

### 3. Timing
- Billets chargés avant authentification complète

**Solution:** Utiliser le bouton "Rafraîchir"

## Test Complet

### 1. Créer un Événement
```
Dashboard Organisateur → Créer un événement
```

### 2. Publier l'Événement
```
Dashboard Organisateur → Publier
```

### 3. Réserver un Billet
```
Page Events (déconnecté) → Sélectionner événement → Réserver
```

### 4. Vérifier Dashboard
```
Dashboard Organisateur → Afficher les billets → Rafraîchir
```

**Résultat attendu:** 1 billet affiché

## Vérification Requête SQL

La requête utilisée:
```sql
SELECT 
  t.id,
  t.buyer_name,
  t.buyer_phone,
  t.qr_token,
  t.is_scanned,
  t.created_at,
  e.id as event_id,
  e.title as event_title,
  e.location as event_location,
  e.date_event,
  tt.id as ticket_type_id,
  tt.name as ticket_type_name,
  tt.price as ticket_price
FROM tickets t
JOIN ticket_types tt ON t.ticket_type_id = tt.id
JOIN events e ON t.event_id = e.id
WHERE e.organizer_id = $1
ORDER BY t.created_at DESC
```

**Points de vérification:**
- ✅ JOIN correct entre `tickets`, `ticket_types`, et `events`
- ✅ Filtre sur `e.organizer_id`
- ✅ Toutes les colonnes nécessaires

## Actions Immédiates

1. **Redémarrer le backend** pour activer les nouveaux logs
2. **Rafraîchir le frontend** (Ctrl+F5)
3. **Cliquer sur "Rafraîchir"** dans la section billets
4. **Observer les logs** dans les deux consoles

## Si le Problème Persiste

Vérifier manuellement en DB:
```sql
-- Compter les billets par organisateur
SELECT 
  e.organizer_id,
  u.email,
  COUNT(t.id) as nb_billets
FROM tickets t
JOIN events e ON t.event_id = e.id
JOIN users u ON e.organizer_id = u.id
GROUP BY e.organizer_id, u.email;
```

Cette requête devrait montrer le nombre réel de billets par organisateur.
