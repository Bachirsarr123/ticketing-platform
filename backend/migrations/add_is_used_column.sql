-- ===============================================
-- MIGRATION: Ajouter la colonne is_used à la table tickets
-- ===============================================
-- Cette colonne permet de suivre si un billet a été utilisé (scanné à l'entrée)
-- Date: 2026-02-05
-- ===============================================

-- Ajouter la colonne is_used si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'is_used'
    ) THEN
        ALTER TABLE tickets ADD COLUMN is_used BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne is_used ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne is_used existe déjà';
    END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes sur is_used
CREATE INDEX IF NOT EXISTS idx_tickets_is_used ON tickets(is_used);

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'tickets' AND column_name = 'is_used';

-- ===============================================
-- FIN DE LA MIGRATION
-- ===============================================
