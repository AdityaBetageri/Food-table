const router = require('express').Router();
const staffController = require('../controllers/staff.controller');
const auth = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

// All staff routes are owner-only
router.get('/', auth, roleGuard('owner'), staffController.getAll);
router.post('/', auth, roleGuard('owner'), staffController.create);
router.patch('/:id/toggle', auth, roleGuard('owner'), staffController.remove);
router.delete('/:id', auth, roleGuard('owner'), staffController.hardDelete);

module.exports = router;
