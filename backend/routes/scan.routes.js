const express = require('express');
const router = express.Router();

const scanController = require('../controllers/scan.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Route de scan (organizer uniquement)
router.post(
  '/',
  authenticate,
  authorize(['organizer']),
  scanController.scanTicket
);

module.exports = router;
