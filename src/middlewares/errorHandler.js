const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected error occurred';

    console.error(`[ERROR] ${new Date().toLocaleString()} - ${statusCode} - ${message}`);

    if (error.stack) {
        console.error(error.stack);
    }

    const response = {
        status: 'error',
        statusCode: statusCode,
        message: message
    };

    if (process.env.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;