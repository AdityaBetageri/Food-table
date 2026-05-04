const router = require('express').Router();
const managementController = require('../controllers/management.controller');

// Platform Management — open access for admin dashboard
// In production, this should use a separate admin authentication system
router.get('/data', managementController.getData);
router.patch('/hotel/:id/status', managementController.updateHotelStatus);

// Access Requests
router.get('/access-requests', managementController.getAccessRequests);
router.patch('/access-requests/:id/approve', managementController.approveRequest);
router.patch('/access-requests/:id/deny', managementController.denyRequest);

module.exports = router;
