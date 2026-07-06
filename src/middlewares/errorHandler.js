const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected error occurred';

    console.error(`[ERROR] ${new Date().toLocaleString()} - ${statusCode} - ${message}`);

    if (error.stack) {
        console.error(error.stack);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && {stack: error.stack})
    });
};

module.exports = errorHandler;