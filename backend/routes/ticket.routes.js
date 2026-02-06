const express = require('express');
const router = express.Router();

const ticketController = require('../controllers/ticket.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Récupérer tous les billets des événements de l'organisateur
router.get(
    '/my-events',
    authenticate,
    authorize(['organizer']),
    ticketController.getMyEventsTickets
);

// Récupérer tous les billets d'un événement spécifique (pour cache offline)
router.get(
    '/event/:eventId',
    authenticate,
    authorize(['organizer']),
    ticketController.getEventTickets
);

module.exports = router;
