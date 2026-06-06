/**
 * RRA Integration Controller
 * 
 * This controller manages the business logic for the two critical API endpoints:
 * 1. getEligibleMembers - Handles requests from RRA to retrieve eligible members
 * 2. updateQuitusStatus - Handles status feedback from RRA about certificates
 * 
 * Controllers act as the interface between routes (user requests) and models (database)
 */

const RRAIntegrationModel = require('../models/rraIntegrationModel');

/**
 * RRA Integration Controller Object
 */
const RRAIntegrationController = {

  /**
   * GET /api/rra/quitus/eligible-members/:year
   * 
   * Retrieves all PSF members who are:
   * - Active (is_active = TRUE)
   * - Eligible for Quitus (eligible_for_quitus = 'Yes')
   * - For the specified fiscal year
   * 
   * This endpoint enables RRA to pull eligible member data for certificate processing
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEligibleMembers(req, res) {
    try {
      // Extract and validate the fiscal year parameter
      const { year } = req.params;

      // Validate year parameter
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Fiscal year parameter is required',
          error: 'MISSING_YEAR_PARAMETER'
        });
      }

      // Validate year format (should be a 4-digit number)
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(year)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year format. Expected a 4-digit year (e.g., 2024, 2025)',
          error: 'INVALID_YEAR_FORMAT'
        });
      }

      // Fetch eligible members from the database
      const eligibleMembers = await RRAIntegrationModel.getEligibleMembersByYear(year);

      // Check if any members were found
      if (eligibleMembers.length === 0) {
        return res.status(404).json({
          success: true,
          message: `No active and Quitus-eligible members found for fiscal year ${year}`,
          count: 0,
          data: []
        });
      }

      // Log the successful request for auditing purposes
      console.log(
        `[RRA API] Eligible members retrieved for year ${year} - Count: ${eligibleMembers.length} - Time: ${new Date().toISOString()}`
      );

      // Return successful response with member data
      return res.status(200).json({
        success: true,
        message: 'Active and Quitus-eligible members list retrieved successfully',
        count: eligibleMembers.length,
        fiscal_year: parseInt(year),
        data: eligibleMembers
      });

    } catch (error) {
      // Log the error for debugging
      console.error('[Controller Error - getEligibleMembers]:', error);

      // Return error response
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving eligible members',
        error: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * POST /api/psf/quitus/status-update
   * 
   * Receives batch status updates from RRA about Quitus certificates.
   * This allows RRA to inform PSF about:
   * - Newly issued certificates (ISSUED)
   * - Revoked certificates (REVOKED)
   * - Expired certificates (EXPIRED)
   * 
   * Request Body Format:
   * {
   *   "updates": [
   *     {
   *       "quitus_reference": "QT-2025-001",
   *       "taxpayer_tin": "123456789",
   *       "status": "ISSUED",
   *       "reason": "Certificate issued successfully"
   *     },
   *     ...
   *   ]
   * }
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateQuitusStatus(req, res) {
    try {
      // Extract updates array from request body
      const { updates } = req.body;

      // Validate that updates array exists and is not empty
      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          message: 'Request body must contain an "updates" array',
          error: 'INVALID_REQUEST_FORMAT'
        });
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Updates array cannot be empty',
          error: 'EMPTY_UPDATES_ARRAY'
        });
      }

      // Validate status enum values
      const validStatuses = ['ISSUED', 'REVOKED', 'EXPIRED'];

      // Arrays to track successful and failed updates
      const successfulUpdates = [];
      const failedUpdates = [];

      // Process each update in the array
      for (let i = 0; i < updates.length; i++) {
        const update = updates[i];

        try {
          // Validate required fields for each update
          if (!update.quitus_reference || !update.taxpayer_tin || !update.status) {
            failedUpdates.push({
              index: i,
              update: update,
              error: 'Missing required fields (quitus_reference, taxpayer_tin, status)'
            });
            continue;
          }

          // Validate status value
          if (!validStatuses.includes(update.status)) {
            failedUpdates.push({
              index: i,
              update: update,
              error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
            continue;
          }

          // Insert or update the status in the database
          await RRAIntegrationModel.upsertQuitusStatusLog({
            quitus_reference: update.quitus_reference,
            taxpayer_tin: update.taxpayer_tin,
            status: update.status,
            reason: update.reason || null
          });

          // Track successful update
          successfulUpdates.push({
            index: i,
            quitus_reference: update.quitus_reference,
            taxpayer_tin: update.taxpayer_tin,
            status: update.status
          });

        } catch (updateError) {
          // Track failed update
          failedUpdates.push({
            index: i,
            update: update,
            error: updateError.message || 'Database error occurred'
          });
        }
      }

      // Log the batch update operation
      console.log(
        `[RRA API] Status update batch processed - Success: ${successfulUpdates.length}, Failed: ${failedUpdates.length} - Time: ${new Date().toISOString()}`
      );

      // Determine response status code
      const statusCode = failedUpdates.length === 0 ? 200 :
        successfulUpdates.length === 0 ? 400 : 207; // 207 = Multi-Status

      // Return response with detailed results
      return res.status(statusCode).json({
        success: failedUpdates.length === 0,
        message: failedUpdates.length === 0
          ? 'All status updates processed successfully'
          : `Batch update completed with ${failedUpdates.length} failure(s)`,
        summary: {
          total: updates.length,
          successful: successfulUpdates.length,
          failed: failedUpdates.length
        },
        successful_updates: successfulUpdates,
        failed_updates: failedUpdates.length > 0 ? failedUpdates : undefined
      });

    } catch (error) {
      // Log the error for debugging
      console.error('[Controller Error - updateQuitusStatus]:', error);

      // Return error response
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing status updates',
        error: 'SYSTEM_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/rra/quitus/search-member
   * 
   * Search for PSF members by company name (partial matching supported).
   * This is particularly useful when:
   * - The exact TIN is unknown
   * - Need to find similar company names
   * - Want to verify company details before processing
   * 
   * Query Parameters:
   * - name (required): Company name or partial name to search
   * - year (optional): Filter by fiscal year
   * - status (optional): 'eligible' (default), 'active', or 'all'
   * 
   * Examples:
   * - /api/rra/quitus/search-member?name=MINING
   * - /api/rra/quitus/search-member?name=SHIJI&year=2025
   * - /api/rra/quitus/search-member?name=LTD&status=all
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchMemberByName(req, res) {
    try {
      // Extract query parameters
      const { name, year, status } = req.query;

      // Validate required 'name' parameter
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Search parameter "name" is required',
          error: 'MISSING_NAME_PARAMETER',
          example: '/api/rra/quitus/search-member?name=COMPANY_NAME'
        });
      }

      // Validate name length (minimum 2 characters for meaningful search)
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search name must be at least 2 characters long',
          error: 'INVALID_NAME_LENGTH'
        });
      }

      // Validate year format if provided
      if (year) {
        const yearRegex = /^\d{4}$/;
        if (!yearRegex.test(year)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid year format. Expected a 4-digit year (e.g., 2024, 2025)',
            error: 'INVALID_YEAR_FORMAT'
          });
        }
      }

      // Validate status parameter if provided
      const validStatuses = ['eligible', 'active', 'all'];
      const searchStatus = status || 'eligible';
      if (!validStatuses.includes(searchStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}`,
          error: 'INVALID_STATUS_PARAMETER'
        });
      }

      // Search for members in the database
      const searchResults = await RRAIntegrationModel.searchMembersByName(
        name.trim(),
        { year, status: searchStatus }
      );

      // Check if any members were found
      if (searchResults.length === 0) {
        return res.status(404).json({
          success: true,
          message: `No members found matching "${name}"`,
          count: 0,
          search_criteria: {
            name: name.trim(),
            year: year || 'all years',
            status: searchStatus
          },
          data: []
        });
      }

      // Log the successful search for auditing purposes
      console.log(
        `[RRA API] Member search - Query: "${name}" - Results: ${searchResults.length} - Status: ${searchStatus} - Time: ${new Date().toISOString()}`
      );

      // Return successful response with search results
      return res.status(200).json({
        success: true,
        message: `Found ${searchResults.length} member(s) matching "${name}"`,
        count: searchResults.length,
        search_criteria: {
          name: name.trim(),
          year: year || 'all years',
          status: searchStatus
        },
        data: searchResults
      });

    } catch (error) {
      // Log the error for debugging
      console.error('[Controller Error - searchMemberByName]:', error);

      // Return error response
      return res.status(500).json({
        success: false,
        message: 'An error occurred while searching for members',
        error: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

};

module.exports = RRAIntegrationController;