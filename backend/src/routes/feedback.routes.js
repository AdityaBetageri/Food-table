const router = require('express').Router();
const feedbackController = require('../controllers/feedback.controller');

// Public — customer submits feedback (no auth)
router.post('/', feedbackController.submit);

module.exports = router;
