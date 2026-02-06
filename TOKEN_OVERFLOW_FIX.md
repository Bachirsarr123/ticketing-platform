# ✅ Fix: Token ID Overflow

## 🐛 Problème

Le token (ID du billet) est trop long et dépasse du billet PNG.

Exemple : `🆔 ID: TICKET_1234567890_ABCDEFGHIJKLMNOP...`

---

## ✅ Solution

### 1. Police Plus Petite
```javascript
// Avant: 16px
ctx.font = '16px Arial, sans-serif';

// Après: 12px monospace
ctx.font = '12px monospace';
```

### 2. Wrapping du Texte
```javascript
const tokenText = `🆔 ID: ${ticketData.qr_token}`;
const maxTokenWidth = width - (padding + 20) * 2;
const tokenLines = wrapText(ctx, tokenText, maxTokenWidth);

tokenLines.forEach(line => {
  ctx.fillText(line, padding + 20, currentY);
  currentY += 20;
});
```

### 3. Couleur Différenciée
```javascript
ctx.fillStyle = '#6b7280'; // Gris plus clair
```

---

## 📊 Résultat

**Avant** ❌
```
🎟 Type: VIP
👤 Nom: John Doe
📞 Téléphone: +33...
🆔 ID: TICKET_1234567890_ABCDEFGHIJK... [COUPÉ]
```

**Après** ✅
```
🎟 Type: VIP
👤 Nom: John Doe
📞 Téléphone: +33...
🆔 ID: TICKET_1234567890_
    ABCDEFGHIJKLMNOP
```

---

## 🧪 Test

1. **Rafraîchir** (Ctrl+F5)
2. **Télécharger billet**
3. **Vérifier** que le token est complet et lisible

---

## ✅ Améliorations

- ✅ Police 12px (au lieu de 16px)
- ✅ Monospace pour meilleure lisibilité
- ✅ Wrapping automatique
- ✅ Couleur gris clair
- ✅ Espacement réduit (20px au lieu de 30px)

Le token complet est maintenant visible !
