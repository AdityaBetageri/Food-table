const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

// Public — customer places order (no login)
router.post('/', orderController.create);

// Protected — owner, chef, waiter can view orders
router.get('/', auth, roleGuard('owner', 'chef', 'waiter'), orderController.getAll);
router.get('/:id', auth, roleGuard('owner', 'chef', 'waiter'), orderController.getById);
router.get('/:id/public', orderController.getPublicOrder);

// Status update — chef or owner
router.put('/:id/status', auth, roleGuard('owner', 'chef', 'waiter'), orderController.updateStatus);

// Payment update — cashier or owner
router.put('/:id/payment', auth, roleGuard('owner', 'cashier'), orderController.updatePayment);

module.exports = router;
