const checkPermission = (requiredPermissionCode) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.role) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (user.role.name === 'ROOT') {
            return next();
        }

        const hasPermission = user.role.permissions.some(
            (permission) => permission.code === requiredPermissionCode
        );

        if(!hasPermission) {
            return res.status(403).json({
                message: `You do not have the necessary permission: ${requiredPermissionCode}`
            });
        }

        next();
    };
};

module.exports = checkPermission;