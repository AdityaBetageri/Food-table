const router = require('express').Router();
const feedbackController = require('../controllers/feedback.controller');
const auth = require('../middleware/auth.middleware');

// Public — customer submits feedback (no auth)
router.post('/', feedbackController.submit);

// Protected — hotel owner fetches feedback
router.get('/', auth, feedbackController.getAllForHotel);

module.exports = router;

