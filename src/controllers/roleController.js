const roleService = require('../services/roleService');

const createRoleController = async (req, res, next) => {
    try {
        const requesterUser = req.user;
        const roleData = req.body;
        const newRole = await roleService.createRole(requesterUser, roleData);

        res.status(201).json({
            status: 'Success',
            message: 'Role created successfully',
            data: newRole
        });
    } catch (error) {
        next(error);
    }
};

const getRoleController = async (req, res, next) => {
    try {
        const requesterUser = req.user;
        const roleId = parseInt(req.params.id, 10);
        
        const role = await roleService.getRole(requesterUser, roleId);

        res.status(200).json({
            status: 'Success',
            data: role
        });
    } catch (error) {
        next(error);
    }
};

const updateRoleController = async (req, res, next) => {
    try {
        const requesterUser = req.user;
        const roleId = parseInt(req.params.id, 10);
        const updateData = req.body;
        const updatedRole = await roleService.updateRole(requesterUser, roleId, updateData);

        res.status(200).json({
            status: 'Success',
            message: 'Role updated successfully',
            data: updatedRole
        });
    } catch (error) {
        next(error);
    }
};

const deleteRoleController = async (req, res, next) => {
    try {
        const requesterUser = req.user;
        const roleId = parseInt(req.params.id, 10);
        const response = await roleService.deleteRole(requesterUser, roleId);
        
        res.status(200).json({
            status: 'Success',
            message: response.message
        });
    } catch (error) {
        next(error);
    }
};

const listRoleController = async (req, res, next) => {
    try {
        const requestedUser = req.user;
        const roles = await roleService.listRole(requestedUser);

        res.status(200).json({
            status: 'Success',
            results: roles.length,
            data: roles
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createRoleController, getRoleController, updateRoleController, deleteRoleController, listRoleController };