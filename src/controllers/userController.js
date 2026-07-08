const userService = require('../services/userService');


const createUserController = async (req, res, next) => {
    try {
        const creatorUser = req.user;
        const userData = req.body;

        const newUser = await userService.createUser(creatorUser, userData);    

        res.status(201).json({
            status: 'Success',
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        next(error);
    }
};

const getUserController = async (req, res, next) => {
    try {
        const requesterUser = req.user;        
        const { id } = req.params;               

        
        const userData = { id: parseInt(id, 10) }

        const user = await userService.getUser(requesterUser, userData);

        res.status(200).json({
            status: 'Success',
            data: user
        });

    } catch (error) {
        next(error);
    }
};

const updateUserController = async (req, res, next) => {
    try {
        const requesterUser = req.user;
        const targetUserId = parseInt(req.params.id, 10);
        const updateData = req.body;

        const updateUser = await userService.updateUser(requesterUser, targetUserId, updateData);

        res.status(200).json({
            status: 'Success',
            message: 'User updated successfully',
            data: updateUser
        });
    } catch (error) {
        next(error);
    }
};

const deleteUserController = async(req, res, next) => {
    try {
        const requesterUser = req.user;
        const targetUserId = parseInt(req.params.id, 10);

        const response = await userService.deleteUser(requesterUser, targetUserId);

        res.status(200).json({
            status: 'Success',
            message: response.message
        });
    } catch (error) {
        next(error);
    }
};

const listUserController = async (req, res, next) => {
    try {
        const requesterUser = req.user; 
        
        const users = await userService.listUser(requesterUser);

        res.status(200).json({
            status: 'Success',
            results: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createUserController, getUserController, updateUserController, deleteUserController, listUserController };