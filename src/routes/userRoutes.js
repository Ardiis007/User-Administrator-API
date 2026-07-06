const { Router } = require('express');
const { createUserController, getUserController, updateUserController, deleteUserController, listUserController} = require('../controllers/userController');

const authenticateToken = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');
const { validateUser } = require('../middlewares/validation');

const router = Router();

router.post('/:id', authenticateToken, checkPermission('Create user'), createUserController);
router.get('/:id', authenticateToken, checkPermission('Get User'), getUserController);
router.put('/:id', authenticateToken, checkPermission('Update User'), updateUserController);
router.delete('/:id', authenticateToken, checkPermission('Delete User'), deleteUserController);
router.get('/', authenticateToken, checkPermission('List User'), listUserController);

module.exports = router;