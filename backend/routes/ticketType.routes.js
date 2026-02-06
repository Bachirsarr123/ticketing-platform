const express = require('express');
const router = express.Router();

const ticketTypeController = require('../controllers/ticketType.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Créer un type de ticket (organizer only)
router.post(
  '/:eventId',
  authenticate,
  authorize(['organizer']),
  ticketTypeController.createTicketType
);

// Lister les types de tickets d’un événement (public)
router.get(
  '/event/:eventId',
  ticketTypeController.getTicketTypesByEvent
);

// Modifier un type de ticket (organizer only)
router.put(
  '/:id',
  authenticate,
  authorize(['organizer']),
  ticketTypeController.updateTicketType
);

// Supprimer un type de ticket (organizer only)
router.delete(
  '/:id',
  authenticate,
  authorize(['organizer']),
  ticketTypeController.deleteTicketType
);

module.exports = router;
