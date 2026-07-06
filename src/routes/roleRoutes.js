const { Router } = require('express');
const { createRoleController, getRoleController, listRoleController, updateRoleController, deleteRoleController} = require('../controllers/roleController');

const authenticateToken = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = Router();

router.post('/', authenticateToken, checkPermission('Create Role'), createRoleController);
router.get('/:id', authenticateToken, checkPermission('Get Role'), getRoleController);
router.put('/:id', authenticateToken, checkPermission('Update Role'), updateRoleController);
router.delete('/:id', authenticateToken, checkPermission('Delete Role'),  deleteRoleController);
router.get('/', authenticateToken, checkPermission('List Role'), listRoleController);

module.exports = router;