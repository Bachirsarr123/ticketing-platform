const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const path = require('path');
const fs = require('fs');

// Upload d'image d'événement (organisateur uniquement)
router.post('/event-image', authenticate, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        // URL de l'image
        const imageUrl = `/uploads/events/${req.file.filename}`;

        res.json({
            message: 'Image uploadée avec succès',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (err) {
        console.error('❌ Erreur upload image:', err);
        res.status(500).json({ message: 'Erreur lors de l\'upload' });
    }
});

// Supprimer une image d'événement
router.delete('/event-image/:filename', authenticate, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/events', filename);

        // Vérifier que le fichier existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Fichier introuvable' });
        }

        // Supprimer le fichier
        fs.unlinkSync(filePath);

        res.json({ message: 'Image supprimée avec succès' });
    } catch (err) {
        console.error('❌ Erreur suppression image:', err);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
