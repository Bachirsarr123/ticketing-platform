const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

// ⚠️ TOUTES les routes nécessitent authentification + rôle admin
router.use(authenticate, authorizeAdmin);

// ===============================================
// GESTION DES ORGANISATEURS
// ===============================================

// Récupérer tous les organisateurs avec stats
router.get('/organizers', adminController.getAllOrganizers);

// Activer/Désactiver un organisateur
router.put('/organizers/:id/toggle', adminController.toggleOrganizerStatus);

// Supprimer un organisateur
router.delete('/organizers/:id', adminController.deleteOrganizer);

// ===============================================
// GESTION DES ÉVÉNEMENTS
// ===============================================

// Récupérer tous les événements
router.get('/events', adminController.getAllEvents);

// Modifier n'importe quel événement
router.put('/events/:id', adminController.updateAnyEvent);

// Publier/Dépublier un événement
router.put('/events/:id/toggle-publish', adminController.toggleEventPublication);

// Supprimer n'importe quel événement
router.delete('/events/:id', adminController.deleteAnyEvent);

// ===============================================
// STATISTIQUES & ANALYTICS
// ===============================================

// Statistiques globales
router.get('/stats/sales', adminController.getSalesStats);

// Statistiques par organisateur
router.get('/stats/organizers/:id', adminController.getOrganizerStats);

module.exports = router;
