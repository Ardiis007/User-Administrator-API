function isValidName(name) {
    return typeof name === 'string' && name.length >= 8;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 10;
}

function validateUser(name, email, password) {
    const { name, email, password } = req.body;
    const errors = []

    if (name !== undefined && !isValidName(name)) {
        errors.push("The name must have at least 10 characters long");
    }
    if (email !== undefined && !isValidEmail(email)) {
        errors.push("The email is invalid");
    }
    if (password !== undefined && !isValidPassword(password)) {
        errors.push("The password must have at least 10 characters long");
    }

    if (req.method === 'POST') {
        if (!name) errors.push("Name is required");
        if (!email) errors.push("Email is required");
        if (!password) errors.push("Password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({ status: 'error', errors });
    }

    next();
}

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !isValidEmail(email)) {
        errors.push('A valid email is required');
    }

    if (!password || !isValidPassword(password)) {
        errors.push('A valid password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ status: 'error', errors });
    }

    next();
};

module.exports = { validateUser, validateLogin }; 