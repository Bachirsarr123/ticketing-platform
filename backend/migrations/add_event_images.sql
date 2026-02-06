-- ===============================================
-- MIGRATION: Ajouter images aux événements
-- ===============================================
-- Ajoute la colonne image_url pour stocker les images de couverture
-- Date: 2026-02-05
-- ===============================================

-- Ajouter la colonne image_url
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_events_image_url ON events(image_url);

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'image_url';

-- ===============================================
-- FIN DE LA MIGRATION
-- ===============================================
