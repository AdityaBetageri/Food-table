const router = require('express').Router();
const menuController = require('../controllers/menu.controller');
const auth = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

// Public — customer gets menu by hotel
router.get('/:hotelId', menuController.getByHotel);

// Protected — owner only
router.post('/', auth, roleGuard('owner'), menuController.create);
router.put('/:id', auth, roleGuard('owner'), menuController.update);
router.delete('/:id', auth, roleGuard('owner'), menuController.remove);
router.patch('/:id/toggle', auth, roleGuard('owner'), menuController.toggle);

module.exports = router;
