-- ===============================================
-- CRÉATION COMPTE ADMINISTRATEUR PAPA
-- ===============================================
-- Email: Papa@gmail.com
-- Mot de passe: papa123
-- ===============================================

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

-- Vérifier la création
SELECT id, name, email, role, is_active, created_at 
FROM users 
WHERE email = 'Papa@gmail.com';

-- ===============================================
-- ✅ COMPTE CRÉÉ AVEC SUCCÈS
-- ===============================================
-- Vous pouvez maintenant vous connecter avec:
-- Email: Papa@gmail.com
-- Mot de passe: papa123
-- ===============================================
