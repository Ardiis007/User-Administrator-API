const { Router } = require('express');
const { login } = require('../controllers/authController');
const {validateLogin} = require('../middlewares/validation');
const router = Router();

router.post('/login', validateLogin, login);

module.exports = router;