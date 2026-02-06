# 📱 Mode Hors-Ligne - Guide Utilisateur

## 🎯 Qu'est-ce que le Mode Hors-Ligne ?

Le mode hors-ligne vous permet de **scanner des billets sans connexion internet** le jour de votre événement.

### **Avantages**
- ✅ Scannez même sans WiFi/4G
- ✅ Pas de latence réseau
- ✅ Synchronisation automatique au retour en ligne
- ✅ Aucune perte de données

---

## 📋 Comment Utiliser le Mode Hors-Ligne

### **Étape 1 : Préparation (Avant l'Événement)**

1. **Connectez-vous** comme organisateur
2. Allez sur **Scanner un Billet** (`/scan-camera`)
3. Cliquez sur **"📥 Préparer Mode Hors-Ligne"**
4. Attendez le téléchargement des billets
5. Message de confirmation : ✅ "Billets téléchargés !"

> 💡 **Important** : Faites cela **avant** d'arriver sur le lieu de l'événement, pendant que vous avez une connexion internet.

---

### **Étape 2 : Scan Hors-Ligne (Pendant l'Événement)**

1. Ouvrez le scanner (`/scan-camera`)
2. Vérifiez l'indicateur : **🔴 Hors ligne**
3. Scannez les billets normalement
4. Chaque scan est validé **localement**
5. Les scans sont ajoutés à la **queue de synchronisation**

**Indicateur** :
```
🔴 Hors ligne
Mode hors-ligne actif
[X scans à synchroniser]
```

---

### **Étape 3 : Synchronisation (Après l'Événement)**

**Automatique** :
- Dès que la connexion revient, les scans sont **synchronisés automatiquement**
- Notification : ✅ "X scan(s) synchronisé(s) !"

**Manuel** (si besoin) :
- Retournez en ligne
- La synchronisation se déclenche automatiquement
- Vérifiez que le compteur "scans à synchroniser" = 0

---

## 🔍 Indicateurs Visuels

### **État de Connexion**

**En ligne** :
```
┌─────────────────────────────────┐
│ 🟢 En ligne                     │
│ Synchronisation automatique     │
│ activée                         │
└─────────────────────────────────┘
```

**Hors ligne** :
```
┌─────────────────────────────────┐
│ 🔴 Hors ligne                   │
│ Mode hors-ligne actif           │
│ [5 scans à synchroniser]        │
└─────────────────────────────────┘
```

### **Résultat de Scan**

**Scan hors-ligne réussi** :
```
✅ Billet valide (Hors-ligne)
👤 Nom: Jean Dupont
📞 Téléphone: 0612345678
🎟 Type: VIP
```

**Scan en ligne réussi** :
```
✅ Billet valide — accès autorisé
👤 Nom: Jean Dupont
📞 Téléphone: 0612345678
🎟 Type: VIP
```

---

## ⚠️ Limitations

### **Ce qui NE fonctionne PAS hors-ligne**
- ❌ Téléchargement initial des billets
- ❌ Création de nouveaux billets
- ❌ Modification des événements
- ❌ Synchronisation immédiate

### **Ce qui FONCTIONNE hors-ligne**
- ✅ Scan de billets (déjà en cache)
- ✅ Validation locale
- ✅ Détection de billets déjà utilisés
- ✅ Statistiques en temps réel

---

## 🔧 Dépannage

### **Problème : "Billet non trouvé dans le cache"**

**Cause** : Le billet n'a pas été téléchargé avant de passer hors-ligne

**Solution** :
1. Reconnectez-vous à internet
2. Cliquez sur "Préparer Mode Hors-Ligne"
3. Attendez le téléchargement complet
4. Réessayez

---

### **Problème : Les scans ne se synchronisent pas**

**Vérifications** :
1. ✅ Connexion internet rétablie ?
2. ✅ Indicateur affiche "🟢 En ligne" ?
3. ✅ Compteur "scans à synchroniser" > 0 ?

**Solution** :
- Attendez quelques secondes (sync automatique)
- Rafraîchissez la page (F5)
- Vérifiez la console (F12) pour les erreurs

---

### **Problème : "Billet déjà scanné (hors-ligne)"**

**Cause** : Le billet a déjà été scanné localement

**Solution** :
- C'est normal ! Le système empêche les doubles scans
- Vérifiez les détails du billet
- Si erreur, attendez la synchronisation pour voir le statut serveur

---

## 💾 Stockage Local

### **Capacité**
- **IndexedDB** : ~50 MB par événement
- Suffisant pour **plusieurs milliers de billets**

### **Nettoyage**
- Cache automatiquement nettoyé après synchronisation
- Pas de nettoyage manuel nécessaire

### **Sécurité**
- Données stockées localement (navigateur)
- Pas d'accès externe
- Validation serveur obligatoire au retour en ligne

---

## 📊 Scénarios d'Utilisation

### **Scénario 1 : Événement en Extérieur**

**Problème** : Mauvaise couverture réseau

**Solution** :
1. Préparez le mode offline à la maison
2. Arrivez sur place
3. Scannez hors-ligne toute la journée
4. Synchronisez le soir en rentrant

---

### **Scénario 2 : Événement en Salle**

**Problème** : WiFi saturé par les participants

**Solution** :
1. Préparez le mode offline avant l'ouverture
2. Désactivez le WiFi/4G
3. Scannez en mode offline
4. Réactivez la connexion après l'événement

---

### **Scénario 3 : Plusieurs Organisateurs**

**Attention** : Risque de conflit si même billet scanné par 2 organisateurs offline

**Gestion** :
- Premier scan gagne (timestamp)
- Deuxième scan → erreur "déjà scanné" au moment de la sync
- Vérifiez les logs de synchronisation

---

## ✅ Bonnes Pratiques

1. **Préparez TOUJOURS le mode offline avant l'événement**
2. **Vérifiez** que tous les billets sont téléchargés
3. **Testez** un scan hors-ligne avant l'événement
4. **Synchronisez** dès que possible après l'événement
5. **Vérifiez** que le compteur "scans à synchroniser" = 0

---

## 🆘 Support

**En cas de problème** :
1. Vérifiez la console navigateur (F12)
2. Notez le message d'erreur exact
3. Vérifiez l'état de connexion
4. Essayez de rafraîchir la page

**Logs utiles** :
```
📥 Téléchargement des billets...
✅ X billets mis en cache
🔍 Validation offline du billet: abc123...
✅ Billet validé offline
🔄 Synchronisation des scans en attente...
✅ Scan synchronisé: abc123...
```

---

**Le mode hors-ligne est maintenant prêt !** 🎉
