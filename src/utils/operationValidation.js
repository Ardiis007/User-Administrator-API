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

module.exports = { validateHierarchy, isSelf };