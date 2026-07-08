const permissionService = require('../services/permissionService');
const { permission } = require('../services/prismaClient');

const getPermissionController = async (req, res, next) => {
    try {

        const permissionId = parseInt(req.params.id, 10);
        const permission = await permissionService.getPermission(permissionId);

        res.status(200).json({
            status: 'Success',
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

const updatePermissionController = async (req, res, next) => {
    try {
        const requestedUser = req.user;
        const permissionId = parseInt(req.params.id, 10);
        const updatedData = req.body;
        const updatedPermission = await permissionService.updatePermission(permissionId, updatedData);

        res.status(200).json({
            status: 'success',
            message: 'Permission updated successfully',
            data: updatedPermission
        });
    } catch (error) {
        next(error);
    }
};

const deletePermissionController = async (req, res, next) => {
    try {
        const requestedUser = req.user;
        const permissionId = parseInt(req.params.id, 10);

        const response = await permissionService.deletePermission(permissionId);

        res.status(200).json({
            status: 'success',
            message: response.message
        });
    } catch (error) {
        next(error);
    }
};

const listPermissionController = async (req, res, next) => {
    try {
        const permissions = await permissionService.listPermission();

        res.status(200).json({
            status: 'success',
            results: permissions.length,
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPermissionController, updatePermissionController, deletePermissionController, listPermissionController };