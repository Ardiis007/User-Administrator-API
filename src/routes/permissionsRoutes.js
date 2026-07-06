const { Router } = require('express');
const { getPermissionController, updatePermissionController, deletePermissionController, listPermissionController } = require('../controllers/permissionController');

const authenticateToken = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = Router();

router.get('/:id', authenticateToken, checkPermission('Get Permission'), getPermissionController);
router.put('/:id', authenticateToken, checkPermission('Update Permission'), updatePermissionController);
router.delete('/:id', authenticateToken, checkPermission('Delete Permission'), deletePermissionController);
router.get('/', authenticateToken, checkPermission('List Permission'), listPermissionController);

module.exports = router;