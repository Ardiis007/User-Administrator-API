const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');

const login = async (req, res, next) => {
    try { 
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({ where: {email} });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (!user.status) {
            return res.status(403).json({ message: 'The user is deactivated' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '2h'}
        );
        
        res.status(200).json({ token, message: 'Successfully login' })
    } catch (error) {
        next(error);
    }
};

module.exports = login;