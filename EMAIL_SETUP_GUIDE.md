# 📧 Configuration Email Gmail

## 🔐 Créer un App Password Gmail

Pour utiliser Gmail SMTP, vous devez créer un **App Password** (mot de passe d'application).

### Étapes :

1. **Activer la validation en 2 étapes**
   - Aller sur https://myaccount.google.com/security
   - Cliquer sur "Validation en 2 étapes"
   - Suivre les instructions pour l'activer

2. **Générer un App Password**
   - Aller sur https://myaccount.google.com/apppasswords
   - Sélectionner "Autre (nom personnalisé)"
   - Entrer "TicketPro" comme nom
   - Cliquer sur "Générer"
   - **Copier le mot de passe** (16 caractères)

3. **Configurer .env**
   ```env
   EMAIL_USER=votre-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

---

## ⚠️ Important

- **Ne jamais commit** le fichier `.env`
- Le `.env` est déjà dans `.gitignore`
- Utiliser un compte Gmail dédié (pas votre compte personnel)

---

## 🧪 Test

Une fois configuré, le backend affichera au démarrage :
```
✅ Service email prêt
```

Si erreur :
```
❌ Erreur configuration email: ...
```
→ Vérifier EMAIL_USER et EMAIL_PASSWORD dans `.env`

---

## 📊 Limites Gmail

- **500 emails/jour** (gratuit)
- Suffisant pour MVP
- Pour production : utiliser SendGrid, Mailgun, etc.
