const validateHierarchy = (requesterUser, targetHierarchyLevel) => {
    if (requesterUser.role.name !== 'ROOT') {
        if (requesterUser.role.hierarchyLevel >= targetHierarchyLevel) {
            throw { statusCode: 403, message: 'Insufficient hierarchy to perform this action on this user or role' };
        }
    }
};

const isSelf = (requesterUserId, targetUserId) => {
    return requesterUserId === targetUserId;
};

const ensureGrantablePermissions = (requesterUser, permissionCodes = []) => {
    if (requesterUser.role.name === 'ROOT') return;

    const ownedCodes = new Set(requesterUser.role.permissions.map(p => p.code));
    const notOwned = permissionCodes.filter(code => !ownedCodes.has(code));

    if (notOwned.length > 0) {
        throw {
            statusCode: 403,
            message: `You cannot grant permissions that you do not possess: ${notOwned.join(', ')}`
        };
    }
};

module.exports = { validateHierarchy, isSelf, ensureGrantablePermissions };