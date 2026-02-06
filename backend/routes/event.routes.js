const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Créer un événement (organizer only)
router.post(
  '/',
  authenticate,
  authorize(['organizer']),
  eventController.createEvent
);

// Lister mes événements (organizer)
router.get(
  '/my',
  authenticate,
  authorize(['organizer']),
  eventController.getMyEvents
);

// Publier un événement
router.put(
  '/:id/publish',
  authenticate,
  authorize(['organizer']),
  eventController.publishEvent
);

// Dépublier un événement
router.put(
  '/:id/unpublish',
  authenticate,
  authorize(['organizer']),
  eventController.unpublishEvent
);

// Modifier un événement
router.put(
  '/:id',
  authenticate,
  authorize(['organizer']),
  eventController.updateEvent
);

// Supprimer un événement
router.delete(
  '/:id',
  authenticate,
  authorize(['organizer']),
  eventController.deleteEvent
);

// Événements publics
router.get('/public', eventController.getPublicEvents);

module.exports = router;
