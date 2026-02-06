# ✅ Fix: Image de Couverture dans Billet

## Problème

Le billet se télécharge mais **sans l'image de l'événement**.

### Cause

**Problème CORS** : L'attribut `crossOrigin = 'anonymous'` bloque le chargement de l'image depuis `localhost:5000`.

---

## Solution Appliquée

### ❌ Avant
```javascript
const img = new Image();
img.crossOrigin = 'anonymous'; // ❌ Bloque CORS
img.src = `http://localhost:5000${eventData.image_url}`;
```

### ✅ Après
```javascript
const img = new Image();
// ✅ Pas de crossOrigin = pas de CORS
img.src = `http://localhost:5000${eventData.image_url}`;
```

### Améliorations
- ✅ Suppression `crossOrigin`
- ✅ Timeout de 3 secondes
- ✅ Meilleure gestion d'erreur
- ✅ Logs détaillés

---

## Test

1. **Rafraîchir** (Ctrl+F5)
2. **Créer événement avec image**
3. **Acheter billet**
4. **Télécharger**

### Console
```
📸 Chargement image événement: /uploads/events/...
✅ Image événement chargée avec succès
✅ QR Code chargé
✅ Billet téléchargé !
```

---

## Résultat

Le billet PNG devrait maintenant contenir :
- ✅ Image de couverture (en haut)
- ✅ Titre événement
- ✅ Date, lieu
- ✅ Infos billet
- ✅ QR Code
- ✅ Footer

---

## Si Image Toujours Absente

Vérifiez dans la console :
- `⚠️ Timeout chargement image` → Image trop lourde
- `⚠️ Impossible de charger l'image` → URL incorrecte
- `⚠️ Erreur lors du dessin` → Problème Canvas

**Le billet se génère quand même**, juste sans l'image.
