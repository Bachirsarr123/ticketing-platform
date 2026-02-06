# 🔧 Guide de Migration - Base de Données

## Problème Actuel

La table `tickets` ne possède pas la colonne `is_used` nécessaire pour :
- Suivre si un billet a été utilisé (scanné)
- Empêcher la réutilisation d'un même billet
- Afficher le statut dans le dashboard organisateur

## Solution Professionnelle

### Étape 1: Se Connecter à PostgreSQL

Ouvrez un nouveau terminal et connectez-vous à votre base de données :

```bash
# Option 1: Si vous avez psql installé localement
psql -U postgres -d ticketing_db

# Option 2: Si vous utilisez un client PostgreSQL (pgAdmin, DBeaver, etc.)
# Connectez-vous via l'interface graphique
```

**Remplacez** `postgres` par votre nom d'utilisateur PostgreSQL et `ticketing_db` par le nom de votre base de données.

### Étape 2: Exécuter la Migration

**Option A - Via psql (ligne de commande):**

```bash
# Depuis le terminal psql
\i C:/Users/sbasarr200/ticketing-platform/backend/migrations/add_is_used_column.sql
```

**Option B - Copier-coller le SQL:**

Si la commande `\i` ne fonctionne pas, copiez le contenu du fichier `add_is_used_column.sql` et collez-le directement dans psql.

**Option C - Via pgAdmin ou autre client graphique:**

1. Ouvrez pgAdmin
2. Connectez-vous à votre base de données
3. Clic droit sur votre base → Query Tool
4. Ouvrez le fichier `add_is_used_column.sql`
5. Cliquez sur Execute (▶️)

### Étape 3: Vérifier la Migration

Exécutez cette requête pour confirmer :

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;
```

**Résultat attendu** - Vous devriez voir :

```
column_name     | data_type | column_default
----------------|-----------|---------------
id              | integer   | nextval(...)
event_id        | integer   | 
ticket_type_id  | integer   | 
buyer_name      | varchar   | 
buyer_phone     | varchar   | 
qr_token        | varchar   | 
is_used         | boolean   | false        ← NOUVELLE COLONNE
purchased_at    | timestamp | CURRENT_TIMESTAMP
```

### Étape 4: Redémarrer le Backend

Une fois la migration terminée :

```bash
# Dans le terminal backend (Ctrl+C pour arrêter)
npm run dev
```

### Étape 5: Tester

1. **Rafraîchir le frontend** (Ctrl+F5)
2. **Se connecter comme organisateur**
3. **Cliquer sur "Afficher les billets"**
4. **Cliquer sur "Rafraîchir"**

**Résultat attendu:**
```
🎫 Récupération billets pour organisateur ID: 2
✅ X billet(s) trouvé(s)
```

Les billets devraient maintenant s'afficher avec le statut "⏳ Réservé".

## Informations Techniques

### Colonne Ajoutée

```sql
is_used BOOLEAN DEFAULT FALSE
```

- **Type:** Boolean (vrai/faux)
- **Valeur par défaut:** FALSE (non utilisé)
- **Nullable:** Non
- **Index:** Oui (pour performances)

### Impact sur le Code

**Backend:**
- ✅ `ticket.controller.js` - Récupère `is_used`
- ✅ `scan.controller.js` - Met à jour `is_used` lors du scan

**Frontend:**
- ✅ `OrganizerDashboard.jsx` - Affiche statut (Réservé/Utilisé)

## Rollback (Annulation)

Si vous souhaitez annuler cette migration :

```sql
-- Supprimer l'index
DROP INDEX IF EXISTS idx_tickets_is_used;

-- Supprimer la colonne
ALTER TABLE tickets DROP COLUMN IF EXISTS is_used;
```

## Support

Si vous rencontrez des erreurs :

1. **Vérifiez la connexion** à PostgreSQL
2. **Vérifiez les permissions** de votre utilisateur
3. **Consultez les logs** backend pour les erreurs SQL
4. **Contactez-moi** avec le message d'erreur exact

---

**Une fois la migration terminée, le système de gestion des billets sera pleinement fonctionnel ! 🎉**
