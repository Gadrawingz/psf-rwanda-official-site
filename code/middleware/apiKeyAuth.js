/**
 * API Key Authentication Middleware
 * 
 * This middleware validates API keys for secure access to RRA-PSF integration endpoints.
 * It checks for an API key in the request headers and validates it against authorized keys.
 * 
 * Security Note: In production, API keys should be stored securely (e.g., environment variables)
 * and potentially validated against a database with rate limiting and expiry mechanisms.
 */

require('dotenv').config();

/**
 * Validates API Key from request headers
 * Expected header format: x-api-key: YOUR_API_KEY
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const apiKeyAuth = (req, res, next) => {
    try {
        // Extract API key from request headers
        const apiKey = req.header('x-api-key');

        // Check if API key is provided
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No API key provided.',
                error: 'MISSING_API_KEY'
            });
        }

        // Retrieve valid API keys from environment variables
        // Format: Comma-separated list of API keys (e.g., "key1,key2,key3")
        const validApiKeys = process.env.RRA_API_KEYS
            ? process.env.RRA_API_KEYS.split(',').map(key => key.trim())
            : [];

        // Validate the provided API key
        if (!validApiKeys.includes(apiKey)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Invalid API key.',
                error: 'INVALID_API_KEY'
            });
        }

        // Log successful authentication (optional - useful for auditing)
        console.log(`[API Auth] Valid API key used at ${new Date().toISOString()}`);

        // API key is valid, proceed to the next middleware/controller
        next();

    } catch (error) {
        console.error('[API Auth Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error occurred.',
            error: 'AUTH_SYSTEM_ERROR'
        });
    }
};

module.exports = apiKeyAuth;