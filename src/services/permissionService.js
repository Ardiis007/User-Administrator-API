const prisma = require('./prismaClient');

const getPermission = async (permissionId) => {
    const permission = await prisma.permission.findUnique({
        where: { id: permissionId }
    });
    
    if (!permission) throw { statusCode: 404, message: 'Permission not found' }; 
    
    return permission;
};

const updatePermission = async (requesterUser, permissionId, updateData) => {
    const { code, description } = updateData;
    
    if (requesterUser.role.name !== 'ROOT') {
        throw { statusCode: 403, message: 'Only ROOT can modify system permissions' };
    }

    const targetPermission = await prisma.permission.findUnique({ 
        where: { id: permissionId } 
    });
    
    if (!targetPermission) throw { statusCode: 404, message: 'Permission not found' };

    if (code && code !== targetPermission.code) {
        const existingPermission = await prisma.permission.findUnique({ where: { code } });
        if (existingPermission) throw { statusCode: 400, message: 'Another permission already has that code' };
    }
    
    const updatedPermission = await prisma.permission.update({
        where: { id: permissionId },
        data: {
            code: code !== undefined ? code : targetPermission.code,
            description: description !== undefined ? description : targetPermission.description
        }
    });

    return updatedPermission; 
};

const deletePermission = async (requesterUser, permissionId) => {
    if (requesterUser.role.name !== 'ROOT') {
        throw { statusCode: 403, message: 'Only ROOT can delete system permissions' };
    }

    const targetPermission = await prisma.permission.findUnique({ 
        where: { id: permissionId } 
    });
    
    if (!targetPermission) throw { statusCode: 404, message: 'Permission not found' };

    await prisma.permission.delete({ where: { id: permissionId } });

    return { message: 'Permission deleted successfully' };
};

const listPermission = async () => {
    return await prisma.permission.findMany();
};


module.exports = { getPermission, updatePermission, deletePermission, listPermission};