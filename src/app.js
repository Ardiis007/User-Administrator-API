const express = require('express');
const cors = require('cors');
const app = express();
const loggerMiddleware = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

app.get('/', (req, res) => {
    res.send('User Administrator API');
});

app.use(errorHandler);

module.exports = app;