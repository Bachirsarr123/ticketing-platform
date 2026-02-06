-- ===============================================
-- MIGRATION: Ajouter fonctionnalités admin
-- ===============================================
-- Ajoute la colonne is_active pour activer/désactiver les organisateurs
-- Date: 2026-02-05
-- ===============================================

-- Ajouter la colonne is_active si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Colonne is_active ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne is_active existe déjà';
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('is_active', 'role')
ORDER BY column_name;

-- ===============================================
-- FIN DE LA MIGRATION
-- ===============================================
