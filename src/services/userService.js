const bcrypt = require('bcrypt');
const prisma = require('./prismaClient');
const { validateHierarchy, isSelf } = require('../utils/operationValidation');

const createUser = async (requesterUser, userData) => {
    const { name, email, password, roleId } = userData;
    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole) throw { statusCode: 404, message: 'The role does not exist' };
    
    validateHierarchy(requesterUser, targetRole.hierarchyLevel);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            status: true,
            roleId
        },

        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            roleId: true 
        }
    });
    return newUser;
};

const getUser = async (requesterUser, { id }) => {
    if (!id) throw { statusCode: 400, message: 'User ID is required' };

    const user = await prisma.user.findUnique({
        where: { id },
        select: { 
            id: true, 
            name: true, 
            email: true, 
            status: true, 
            role: true 
        }
    });

    if (!user) throw { statusCode: 404, message: 'User not found' };
    
    validateHierarchy(requesterUser, user.role?.hierarchyLevel);

    return user;
};

const updateUser = async (requesterUser, targetUserId, updateData) => {
    const { name, email, password, currentPassword, status, roleId } = updateData;

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: {role: true}
    });

    if (!targetUser) throw { statusCode: 404, message: 'User not found' };

    const isRoot = requesterUser.role.name === 'ROOT'; 
    const isSelfUpdate = isSelf(requesterUser.id, targetUser.id);

    if (isSelfUpdate) {
        if (!isRoot && (status !== undefined || roleId !== undefined)) {
            throw { statusCode: 403, message: 'You can not change your own role or status' };
        }
        
        if (password !== undefined && password !== null && password !== '') {
            if (!currentPassword) {
                throw { statusCode: 400, message: 'Current password is required to change your password' };
            }
            
            const isMatch = await bcrypt.compare(currentPassword, targetUser.password);
            if (!isMatch) {
                throw { statusCode: 401, message: 'The current password you entered is incorrect' };
            }
        }
    } else {
        validateHierarchy(requesterUser, targetUser.role.hierarchyLevel);        

        if (status !== undefined) {
            if (!isRoot) {
                const hasStatusPermission = requesterUser.role.permissions.some(
                    (p) => p.code === 'ChangeUserStatus'
                );
                
                if (!hasStatusPermission) {
                    throw { statusCode: 403, message: 'You do not have the ChangeUserStatus permission' };
                }
            }
        }

        if (roleId !== undefined) {
            const newRole = await prisma.role.findUnique({
                where: { id: roleId }
            });

            if (!newRole) throw { statusCode: 404, message: 'The new role does not exist' };
            
            if (newRole.name === 'ROOT') {
                throw { statusCode: 403, message: 'El rol ROOT no puede ser asignado.' };
            }

            if (newRole.hierarchyLevel <= requesterUser.role.hierarchyLevel) {
                throw { statusCode: 403, message: 'No puedes asignar un rol con un nivel de jerarquía igual o mayor al tuyo.' };
            }
        }
    }

    if (targetUser.role.name === 'ROOT') {
        throw { 
            statusCode: 403, 
            message: 'The ROOT user is immutable and cannot be modified by anyone' 
        };
    }

    let hashedPassword = targetUser.password;
    if (password !== undefined && password !== null && password !== '') {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    return await prisma.user.update({
        where: { id: targetUserId },
        data: {
            name: name !== undefined ? name : targetUser.name,
            email: email !== undefined ? email : targetUser.email,
            password: hashedPassword !== undefined ? hashedPassword : targetUser.password,
            status: status !== undefined ? status : targetUser.status,
            roleId: roleId !== undefined ? roleId : targetUser.roleId
        },
        select: { id: true, name: true, email: true, status: true, roleId: true }
    });
};


const deleteUser = async (requesterUser, targetUserId) => {
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { role: true }
    });

    if (!targetUser) throw { statusCode: 404, message: 'User not found' };
    if (targetUser.role.name === 'ROOT') throw { statusCode: 403, message: 'ROOT can not be deleted' };

    validateHierarchy(requesterUser, targetUser.role.hierarchyLevel);

    await prisma.user.delete({ where: { id: targetUserId } });
    return { message: 'User deleted successfully' };
};

const listUser = async (requesterUser) => {
    let whereCondition = {}

    if (requesterUser.role.name !== 'ROOT') {
        whereCondition = {
            role: {
                hierarchyLevel: { gt: requesterUser.role.hierarchyLevel }
            }
        };
    }

    return await prisma.user.findMany({
        where: whereCondition,
        select: { id: true, name: true, email: true, status: true, role: true }
    });
};

module.exports = { createUser, getUser, updateUser, deleteUser, listUser }