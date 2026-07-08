const prisma = require('./prismaClient');
const { validateHierarchy, ensureGrantablePermissions } = require('../utils/operationValidation');

const createRole = async(requesterUser, roleData) => {
    const { name, hierarchyLevel, permissions } = roleData;
    
    validateHierarchy(requesterUser, hierarchyLevel);
    ensureGrantablePermissions(requesterUser, permissions);

    const existingRole = await prisma.role.findUnique({ where: {name} });
    if (existingRole) {
        throw { statusCode: 400, message: 'A role with this name already exists' };
    }

    const newRole = await prisma.role.create({
        data: {
            name, 
            hierarchyLevel,
            permissions: {
                connect: permissions ? permissions.map(code => ({ code })): []
            }
        },
        include: { permissions: true }
    });

    return newRole;
};

const getRole = async (requesterUser, roleId) => {
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: true }
    });

    if (!role) {
        throw { statusCode: 404, message: 'Role not found' };
    }
    
    validateHierarchy(requesterUser, role.hierarchyLevel);

    return role;
}

const updateRole = async (requesterUser, roleId, updateData) => {
    const { name, hierarchyLevel, permissions } = updateData;

    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole) throw { statusCode: 403, message: 'Role not found' };

    if (targetRole.name === 'ROOT') {
        throw { statusCode: 403, message: 'The ROOT role can not be modified' };
    }
    
    validateHierarchy(requesterUser, targetRole.hierarchyLevel);
    if (hierarchyLevel !== undefined) {
        validateHierarchy(requesterUser, hierarchyLevel);
    }
    if (permissions) ensureGrantablePermissions(requesterUser, permissions);

    if (name && name !== targetRole.name) {
        const existingRole = await prisma.role.findUnique({ where: {name} });
        if (existingRole) throw { statusCode: 400, message: 'Another role already has that name' };
    }


    const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: {
            name: name !== undefined ? name : targetRole.name,
            hierarchyLevel: hierarchyLevel !== undefined ? hierarchyLevel: targetRole.hierarchyLevel,
            permissions: permissions ? {
                set: permissions.map(p => ({ code: p }))
            } : undefined
        },
        include: { permissions: true }
    });

    return updatedRole;
}

const deleteRole = async (requesterUser, roleId) => {
    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole) throw { statusCode: 404, message: 'Role not found' };

    if (targetRole.name === 'ROOT') {
        throw { statusCode: 403, message: 'The role ROOT cannot be deleted' };
    }

    if (targetRole.name === 'USER') {
        throw { statusCode: 403, message: 'The default role USER cannot be deleted' };
    }

    validateHierarchy(requesterUser, targetRole.hierarchyLevel);

    const defaultRole = await prisma.role.findUnique({ where: {name: 'USER'} });
    if (!defaultRole) throw { statusCode: 500, message: 'Intern error: USER role not found in the system' };

    await prisma.user.updateMany({
        where: { roleId: roleId },
        data: {roleId: defaultRole.id }
    });

    await prisma.role.delete({ where: { id: roleId } });

    return { message: `Role deleted successfully. The users were reassigned to the role ${defaultRole.name}`};
};

const listRole = async (requesterUser) => {
    let whereCondition = {};
    if (requesterUser.role.name !== 'ROOT') {
        whereCondition = {
            hierarchyLevel: { gt: requesterUser.role.hierarchyLevel }
        };
    }

    return await prisma.role.findMany({
        where: whereCondition, select: {
            id: true,
            name: true,
            hierarchyLevel: true,
            permissions: {
                select: {
                    code: true
                }
            },
            users: {
                select: {
                    name: true
                }
            }
        }
    });
};

module.exports = { createRole, getRole, updateRole, deleteRole, listRole };