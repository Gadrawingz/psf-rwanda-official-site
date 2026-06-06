/**
 * RRA Integration Routes
 * 
 * This module defines three critical API endpoints for data exchange between PSF and RRA:
 * 1. GET /api/rra/quitus/eligible-members/:year - For RRA to retrieve eligible members
 * 2. GET /api/rra/quitus/search-member - For RRA to search members by company name
 * 3. POST /api/psf/quitus/status-update - For RRA to send status feedback
 * 
 * All endpoints are protected with API Key authentication middleware
 */

const express = require('express');
const router = express.Router();
const rraIntegrationController = require('../controllers/rraIntegrationController');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// ============================================================================
// API SURFACE 1: PSF to RRA (Data Retrieval by Year)
// ============================================================================
/**
 * @route GET /api/rra/quitus/eligible-members/:year
 * @desc Retrieve all active and Quitus-eligible PSF members for a specific fiscal year
 * @param {string} year - Fiscal year (e.g., 2024, 2025)
 * @access Protected (API Key required)
 * @returns {json} List of eligible members with their details
 */
router.get(
    '/rra/quitus/eligible-members/:year',
    apiKeyAuth,
    rraIntegrationController.getEligibleMembers
);

// ============================================================================
// API SURFACE 1B: PSF to RRA (Search by Company Name)
// ============================================================================
/**
 * @route GET /api/rra/quitus/search-member
 * @desc Search for members by company name (partial match supported)
 * @query {string} name - Company name or partial name to search (required)
 * @query {string} year - Optional fiscal year filter (e.g., 2024, 2025)
 * @query {string} status - Optional filter: 'all', 'eligible', 'active' (default: 'eligible')
 * @access Protected (API Key required)
 * @returns {json} List of matching members with their details
 * @example /api/rra/quitus/search-member?name=MINING
 * @example /api/rra/quitus/search-member?name=SHIJI&year=2025
 * @example /api/rra/quitus/search-member?name=LTD&status=all
 */
router.get(
    '/rra/quitus/search-member',
    apiKeyAuth,
    rraIntegrationController.searchMemberByName
);

// ============================================================================
// API SURFACE 2: RRA to PSF (Status Feedback)
// ============================================================================
/**
 * @route POST /api/psf/quitus/status-update
 * @desc Receive batch status updates from RRA about Quitus certificates
 * @body {array} Array of status update objects with quitus_reference, taxpayer_tin, status, reason
 * @access Protected (API Key required)
 * @returns {json} Success/failure status with details
 */
router.post(
    '/psf/quitus/status-update',
    apiKeyAuth,
    rraIntegrationController.updateQuitusStatus
);

module.exports = router;