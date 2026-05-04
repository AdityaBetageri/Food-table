const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/hotel', auth, authController.updateHotel);

module.exports = router;
