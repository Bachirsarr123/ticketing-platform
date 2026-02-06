# 🧪 Plan de Test - Mode Hors-Ligne

## 📋 Test 1 : Préparation Offline

### Objectif
Vérifier que les billets sont correctement téléchargés et mis en cache.

### Étapes
1. ✅ Se connecter comme organisateur
2. ✅ Aller sur `/scan-camera`
3. ✅ Sélectionner un événement dans le menu déroulant
4. ✅ Cliquer "📥 Préparer Mode Hors-Ligne"
5. ✅ Attendre le message de confirmation

### Résultat Attendu
- ✅ Message : "Billets téléchargés ! Vous pouvez maintenant scanner hors-ligne"
- ✅ Aucune erreur dans la console
- ✅ Logs backend : "X billets mis en cache"

### Statut
✅ **RÉUSSI**

---

## 📋 Test 2 : Scan Hors-Ligne

### Objectif
Vérifier que les billets peuvent être scannés sans connexion internet.

### Étapes
1. Ouvrir DevTools (F12)
2. Onglet "Network" → Cocher "Offline"
3. Vérifier l'indicateur : 🔴 "Hors ligne"
4. Scanner un billet (ou saisie manuelle)
5. Vérifier le résultat

### Résultat Attendu
- Message : "✅ Billet valide (Hors-ligne)"
- Détails du billet affichés
- Compteur "scans à synchroniser" incrémenté
- Pas d'appel réseau

### Statut
⏳ **À TESTER**

---

## 📋 Test 3 : Détection Double Scan Offline

### Objectif
Vérifier qu'un billet ne peut pas être scanné deux fois en mode offline.

### Étapes
1. Mode offline activé
2. Scanner un billet une première fois → ✅
3. Scanner le MÊME billet une deuxième fois
4. Vérifier le message d'erreur

### Résultat Attendu
- Message : "❌ Billet déjà scanné (hors-ligne)"
- Pas d'incrémentation du compteur

### Statut
⏳ **À TESTER**

---

## 📋 Test 4 : Synchronisation Automatique

### Objectif
Vérifier que les scans offline sont synchronisés automatiquement au retour en ligne.

### Étapes
1. Scanner 2-3 billets en mode offline
2. Vérifier compteur "X scans à synchroniser"
3. Désactiver le mode offline (Network → Online)
4. Attendre quelques secondes
5. Vérifier la notification

### Résultat Attendu
- Notification : "✅ X scan(s) synchronisé(s) !"
- Compteur "scans à synchroniser" → 0
- Indicateur : 🟢 "En ligne"
- Logs backend : "Scan synchronisé: ..."

### Statut
⏳ **À TESTER**

---

## 📋 Test 5 : Billet Non Caché

### Objectif
Vérifier le comportement quand on scanne un billet non téléchargé.

### Étapes
1. Mode offline activé
2. Scanner un billet d'un AUTRE événement (non préparé)
3. Vérifier le message d'erreur

### Résultat Attendu
- Message : "❌ Billet non trouvé dans le cache"

### Statut
⏳ **À TESTER**

---

## 📋 Test 6 : Scan Online Normal

### Objectif
Vérifier que le scan online fonctionne toujours normalement.

### Étapes
1. Mode online (connexion active)
2. Scanner un billet
3. Vérifier le résultat

### Résultat Attendu
- Message : "✅ Billet valide — accès autorisé" (sans mention "Hors-ligne")
- Validation immédiate côté serveur
- Pas d'ajout à la queue de sync

### Statut
⏳ **À TESTER**

---

## 📋 Test 7 : Basculement Online/Offline

### Objectif
Vérifier que l'indicateur de connexion fonctionne correctement.

### Étapes
1. Page ouverte en mode online → 🟢
2. Passer en mode offline → 🔴
3. Repasser en mode online → 🟢

### Résultat Attendu
- Indicateur change en temps réel
- Pas de rechargement de page nécessaire

### Statut
⏳ **À TESTER**

---

## 📋 Test 8 : Régression - Fonctionnalités Existantes

### Objectif
Vérifier qu'aucune fonctionnalité existante n'est cassée.

### Checklist
- [ ] Connexion organisateur
- [ ] Création événement
- [ ] Achat billet (visiteur)
- [ ] Scan manuel (online)
- [ ] Dashboard organisateur
- [ ] Liste des billets

### Statut
⏳ **À TESTER**

---

## 🎯 Résumé des Tests

| Test | Statut | Priorité |
|------|--------|----------|
| 1. Préparation Offline | ✅ RÉUSSI | 🔴 Haute |
| 2. Scan Hors-Ligne | ⏳ À tester | 🔴 Haute |
| 3. Double Scan Offline | ⏳ À tester | 🟡 Moyenne |
| 4. Sync Automatique | ⏳ À tester | 🔴 Haute |
| 5. Billet Non Caché | ⏳ À tester | 🟡 Moyenne |
| 6. Scan Online Normal | ⏳ À tester | 🔴 Haute |
| 7. Basculement Online/Offline | ⏳ À tester | 🟢 Basse |
| 8. Régression | ⏳ À tester | 🔴 Haute |

---

## 📝 Instructions de Test

### Pour tester maintenant :

1. **Test 2** : Activez le mode offline et scannez un billet
2. **Test 3** : Scannez le même billet deux fois
3. **Test 4** : Réactivez la connexion et vérifiez la sync
4. **Test 6** : Scannez un nouveau billet en mode online

### Commandes utiles :

**Console DevTools** :
```javascript
// Vérifier IndexedDB
indexedDB.databases()

// Vérifier le cache
caches.keys()

// Forcer la sync
// (sera implémenté si nécessaire)
```

**Logs Backend** :
- Cherchez "🔄 Synchronisation"
- Cherchez "✅ Scan synchronisé"

---

**Prêt pour les tests !** 🚀
