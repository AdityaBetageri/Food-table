const router = require('express').Router();
const managementController = require('../controllers/management.controller');
const managementAuth = require('../middleware/managementAuth.middleware');

// All management data routes are now protected by management auth middleware
// Only authenticated admins from the 'admins' collection can access these

router.get('/data', managementAuth, managementController.getData);
router.patch('/hotel/:id/status', managementAuth, managementController.updateHotelStatus);
router.patch('/hotel/:id/plan', managementAuth, managementController.updateHotelPlan);

// Access Requests
router.get('/access-requests', managementAuth, managementController.getAccessRequests);
router.patch('/access-requests/:id/approve', managementAuth, managementController.approveRequest);
router.patch('/access-requests/:id/deny', managementAuth, managementController.denyRequest);

module.exports = router;
