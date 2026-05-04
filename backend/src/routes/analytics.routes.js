const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');
const feedbackController = require('../controllers/feedback.controller');
const auth = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

// Analytics — owner only
router.get('/summary', auth, roleGuard('owner'), analyticsController.getSummary);
router.get('/heatmap', auth, roleGuard('owner'), analyticsController.getHeatmap);

module.exports = router;
