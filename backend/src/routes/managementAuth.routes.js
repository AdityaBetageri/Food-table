const router = require('express').Router();
const managementAuthController = require('../controllers/managementAuth.controller');
const managementAuth = require('../middleware/managementAuth.middleware');

// Public routes (no token needed)
router.post('/login', managementAuthController.login);
router.post('/register', managementAuthController.register);

// Protected routes (management token required)
router.get('/me', managementAuth, managementAuthController.getMe);

module.exports = router;
