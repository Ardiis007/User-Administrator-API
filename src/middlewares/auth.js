const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(!token) {
            return res.status(401).json({ message: 'Access denied, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            include: {
                role: {
                    include:{
                        permissions: true
                    }
                }
            }
        });

        if (!user || !user.status) {
            return res.status(403).json({ message: 'User not found or inactive' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;