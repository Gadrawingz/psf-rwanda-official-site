/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Set default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    console.error(`Error: ${message}`);
    console.error(err.stack);

    // Check if the request is an API request or a web request
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // Send JSON response for API requests
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Render error page for web requests
    res.status(statusCode).render('error', {
        title: 'Error',
        message,
        error: {
            status: statusCode,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        }
    });
};

module.exports = {
    errorHandler
};