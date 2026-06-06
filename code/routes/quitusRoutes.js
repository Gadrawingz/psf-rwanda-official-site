// API routes for quitus recommendation

const express = require('express');
const router = express.Router();
const quitusController = require('../controllers/quitusController');

// Optional: API authentication middleware
// const apiAuth = require('../middleware/apiAuth');

/**
 * @route   GET /api/quitus/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', quitusController.healthCheck);

/**
 * @route   POST /api/quitus/verify
 * @desc    Verify single member by TIN
 * @access  Protected (add apiAuth middleware if needed)
 * @body    { tin: "123456789" }
 */
router.post('/verify', quitusController.verifyMember);

/**
 * @route   GET /api/quitus/active-members
 * @desc    Get all active members eligible for quitus
 * @access  Protected (add apiAuth middleware if needed)
 */
router.get('/active-members', quitusController.getActiveMembers);

/**
 * @route   POST /api/quitus/verify-batch
 * @desc    Verify multiple members by TINs
 * @access  Protected (add apiAuth middleware if needed)
 * @body    { tins: ["123456789", "987654321", ...] }
 */
router.post('/verify-batch', quitusController.verifyBatch);

module.exports = router;