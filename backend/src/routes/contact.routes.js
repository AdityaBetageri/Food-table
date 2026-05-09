const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// POST /api/contact/submit
router.post('/submit', contactController.submitContactForm);

module.exports = router;
