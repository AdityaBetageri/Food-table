const router = require('express').Router();
const tableController = require('../controllers/table.controller');
const auth = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

// All table routes are owner-only
router.get('/', auth, roleGuard('owner'), tableController.getAll);
router.post('/', auth, roleGuard('owner'), tableController.create);
router.delete('/:id', auth, roleGuard('owner'), tableController.remove);
router.put('/:id', auth, roleGuard('owner'), tableController.update);
router.get('/:id/qr', auth, roleGuard('owner'), tableController.getQR);

module.exports = router;
