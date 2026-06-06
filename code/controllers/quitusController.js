// quitusController.js - New controller for quitus API endpoints

const CompanyModel = require('../models/companyModel');

const quitusController = {
  /**
   * Verify member by TIN and return quitus recommendation data
   * POST /api/quitus/verify
   * Body: { tin: "123456789" }
   */
  verifyMember: async (req, res) => {
    try {
      const { tin } = req.body;

      // Validate TIN format
      if (!tin || !/^\d{9}$/.test(tin.toString())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid TIN format. TIN must be exactly 9 digits',
          data: null
        });
      }

      // Log the request
      await CompanyModel.logQuitusRequest(tin, 'RRA');

      // Get member details
      const member = await CompanyModel.getQuitusMemberByTin(tin);

      if (!member) {
        return res.status(404).json({
          success: false,
          error: 'Member not found or not active in PSF system',
          data: null
        });
      }

      // Determine fiscal year and eligibility
      const currentYear = new Date().getFullYear();
      const fiscalYear = currentYear;
      const eligibleForQuitus = fiscalYear === 2025 && member.membership_status === 'active';

      // Prepare response data
      const responseData = {
        taxpayer_tin: member.taxpayer_tin,
        taxpayer_name: member.taxpayer_name,
        taxpayer_phone: member.taxpayer_phone,
        taxpayer_email: member.taxpayer_email || 'N/A',
        official_representative: member.official_representative,
        representative_phone: member.representative_phone,
        fiscal_year: fiscalYear,
        eligible_for_quitus: eligibleForQuitus ? 'Yes' : 'No'
      };

      return res.status(200).json({
        success: true,
        message: 'Member verification successful',
        data: responseData
      });

    } catch (error) {
      console.error('Error in quitus verification:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during verification',
        data: null
      });
    }
  },

  /**
   * Get all active members eligible for quitus
   * GET /api/quitus/active-members
   */
  getActiveMembers: async (req, res) => {
    try {
      const members = await CompanyModel.getAllActiveQuitusMembers();

      const currentYear = new Date().getFullYear();
      const fiscalYear = currentYear;

      // Format response data
      const formattedMembers = members.map(member => ({
        taxpayer_tin: member.taxpayer_tin,
        taxpayer_name: member.taxpayer_name,
        taxpayer_phone: member.taxpayer_phone,
        taxpayer_email: member.taxpayer_email || 'N/A',
        official_representative: member.official_representative,
        representative_phone: member.representative_phone,
        fiscal_year: fiscalYear,
        eligible_for_quitus: fiscalYear === 2025 ? 'Yes' : 'No'
      }));

      return res.status(200).json({
        success: true,
        message: 'Active members list retrieved successfully',
        count: formattedMembers.length,
        data: formattedMembers
      });

    } catch (error) {
      console.error('Error fetching active members:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error while fetching members',
        data: null
      });
    }
  },

  /**
   * Batch verify multiple TINs
   * POST /api/quitus/verify-batch
   * Body: { tins: ["123456789", "987654321"] }
   */
  verifyBatch: async (req, res) => {
    try {
      const { tins } = req.body;

      if (!Array.isArray(tins) || tins.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request. Provide an array of TINs',
          data: null
        });
      }

      // Limit batch size
      if (tins.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Batch size exceeds limit. Maximum 100 TINs per request',
          data: null
        });
      }

      const results = [];
      const currentYear = new Date().getFullYear();
      const fiscalYear = currentYear;

      for (const tin of tins) {
        // Validate TIN format
        if (!/^\d{9}$/.test(tin.toString())) {
          results.push({
            taxpayer_tin: tin,
            success: false,
            error: 'Invalid TIN format'
          });
          continue;
        }

        try {
          // Log the request
          await CompanyModel.logQuitusRequest(tin, 'RRA_BATCH');

          // Get member details
          const member = await CompanyModel.getQuitusMemberByTin(tin);

          if (!member) {
            results.push({
              taxpayer_tin: tin,
              success: false,
              error: 'Member not found or not active'
            });
            continue;
          }

          const eligibleForQuitus = fiscalYear === 2025 && member.membership_status === 'active';

          results.push({
            taxpayer_tin: member.taxpayer_tin,
            taxpayer_name: member.taxpayer_name,
            taxpayer_phone: member.taxpayer_phone,
            taxpayer_email: member.taxpayer_email || 'N/A',
            official_representative: member.official_representative,
            representative_phone: member.representative_phone,
            fiscal_year: fiscalYear,
            eligible_for_quitus: eligibleForQuitus ? 'Yes' : 'No',
            success: true
          });

        } catch (error) {
          results.push({
            taxpayer_tin: tin,
            success: false,
            error: 'Error processing TIN'
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Batch verification completed',
        total_requested: tins.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        data: results
      });

    } catch (error) {
      console.error('Error in batch verification:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during batch verification',
        data: null
      });
    }
  },

  /**
   * Health check endpoint
   * GET /api/quitus/health
   */
  healthCheck: async (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Quitus API is operational',
      timestamp: new Date().toISOString(),
      fiscal_year: new Date().getFullYear()
    });
  }
};

module.exports = quitusController;