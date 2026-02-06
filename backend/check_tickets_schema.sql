-- Vérifier la structure de la table tickets
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tickets'
ORDER BY ordinal_position;

-- Voir quelques exemples de données
SELECT * FROM tickets LIMIT 5;
