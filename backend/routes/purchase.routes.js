const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchase.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Acheter un ticket
router.post(
  '/:ticketTypeId',
  purchaseController.purchaseTicket
);


module.exports = router;
