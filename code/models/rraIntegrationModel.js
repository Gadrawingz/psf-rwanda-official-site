/**
 * RRA Integration Model
 * 
 * This model handles all database operations for the RRA-PSF integration:
 * 1. Fetching eligible members from psf_members table
 * 2. Inserting/updating status logs in quitus_status_log table
 * 
 * Database Schema:
 * - psf_members: Main table containing member information and eligibility status
 * - quitus_status_log: Table for tracking Quitus certificate status updates from RRA
 */

const db = require('../config/database');

/**
 * RRA Integration Model Object
 */
const RRAIntegrationModel = {

    /**
     * Fetch all active and Quitus-eligible members for a specific fiscal year
     * 
     * CRITICAL LOGIC:
     * - is_active must be TRUE
     * - eligible_for_quitus must be 'Yes'
     * - fiscal_year must match the requested year
     * 
     * @param {number|string} year - Fiscal year to filter by
     * @returns {Promise<Array>} Array of eligible member objects
     */
    async getEligibleMembersByYear(year) {
        try {
            const sql = `
        SELECT 
          taxpayer_tin,
          taxpayer_name,
          taxpayer_phone,
          taxpayer_email,
          official_representative,
          representative_phone,
          fiscal_year,
          eligible_for_quitus
        FROM 
          psf_members
        WHERE 
          is_active = TRUE
          AND eligible_for_quitus = 'Yes'
          AND fiscal_year = ?
        ORDER BY 
          taxpayer_name ASC
      `;

            const [rows] = await db.query(sql, [year]);
            return rows;

        } catch (error) {
            console.error('[Model Error - getEligibleMembersByYear]:', error);
            throw error;
        }
    },

    /**
     * Insert a new Quitus status update into the log table
     * 
     * This method records feedback from RRA about certificate status.
     * Status values: 'ISSUED', 'REVOKED', 'EXPIRED'
     * 
     * @param {Object} statusData - Status update data
     * @param {string} statusData.quitus_reference - Unique reference for the Quitus certificate
     * @param {string} statusData.taxpayer_tin - TIN of the taxpayer
     * @param {string} statusData.status - Status enum: ISSUED, REVOKED, EXPIRED
     * @param {string} statusData.reason - Reason or notes for the status
     * @returns {Promise<Object>} Insert result with insertId
     */
    async insertQuitusStatusLog(statusData) {
        try {
            const { quitus_reference, taxpayer_tin, status, reason } = statusData;

            const sql = `
        INSERT INTO quitus_status_log 
          (quitus_reference, taxpayer_tin, status, reason, date_updated)
        VALUES 
          (?, ?, ?, ?, NOW())
      `;

            const [result] = await db.query(sql, [
                quitus_reference,
                taxpayer_tin,
                status,
                reason || null
            ]);

            return result;

        } catch (error) {
            console.error('[Model Error - insertQuitusStatusLog]:', error);
            throw error;
        }
    },

    /**
     * Update an existing Quitus status log entry
     * 
     * This method updates a record if it already exists in the log.
     * Useful for cases where RRA needs to update status (e.g., from ISSUED to REVOKED)
     * 
     * @param {Object} statusData - Status update data
     * @param {string} statusData.quitus_reference - Unique reference for the Quitus certificate
     * @param {string} statusData.taxpayer_tin - TIN of the taxpayer
     * @param {string} statusData.status - Status enum: ISSUED, REVOKED, EXPIRED
     * @param {string} statusData.reason - Reason or notes for the status
     * @returns {Promise<Object>} Update result
     */
    async updateQuitusStatusLog(statusData) {
        try {
            const { quitus_reference, taxpayer_tin, status, reason } = statusData;

            const sql = `
        UPDATE quitus_status_log
        SET 
          status = ?,
          reason = ?,
          date_updated = NOW()
        WHERE 
          quitus_reference = ?
          AND taxpayer_tin = ?
      `;

            const [result] = await db.query(sql, [
                status,
                reason || null,
                quitus_reference,
                taxpayer_tin
            ]);

            return result;

        } catch (error) {
            console.error('[Model Error - updateQuitusStatusLog]:', error);
            throw error;
        }
    },

    /**
     * Check if a Quitus status log entry exists
     * 
     * @param {string} quitus_reference - Unique reference for the Quitus certificate
     * @param {string} taxpayer_tin - TIN of the taxpayer
     * @returns {Promise<boolean>} True if exists, false otherwise
     */
    async checkQuitusStatusExists(quitus_reference, taxpayer_tin) {
        try {
            const sql = `
        SELECT COUNT(*) as count
        FROM quitus_status_log
        WHERE quitus_reference = ? AND taxpayer_tin = ?
      `;

            const [rows] = await db.query(sql, [quitus_reference, taxpayer_tin]);
            return rows[0].count > 0;

        } catch (error) {
            console.error('[Model Error - checkQuitusStatusExists]:', error);
            throw error;
        }
    },

    /**
     * Upsert (Insert or Update) Quitus status log
     * 
     * This method intelligently inserts a new record or updates an existing one
     * 
     * @param {Object} statusData - Status update data
     * @returns {Promise<Object>} Operation result
     */
    async upsertQuitusStatusLog(statusData) {
        try {
            const exists = await this.checkQuitusStatusExists(
                statusData.quitus_reference,
                statusData.taxpayer_tin
            );

            if (exists) {
                return await this.updateQuitusStatusLog(statusData);
            } else {
                return await this.insertQuitusStatusLog(statusData);
            }

        } catch (error) {
            console.error('[Model Error - upsertQuitusStatusLog]:', error);
            throw error;
        }
    },

    /**
     * Search for members by company name (partial match using LIKE)
     * 
     * This method enables flexible searching:
     * - Partial name matching (e.g., "MINING" finds "SHIJI MINING C")
     * - Optional year filtering
     * - Optional status filtering (eligible only, active only, or all)
     * 
     * @param {string} searchName - Company name or partial name to search
     * @param {Object} options - Optional filters
     * @param {number|string} options.year - Fiscal year to filter by
     * @param {string} options.status - 'eligible' (default), 'active', or 'all'
     * @returns {Promise<Array>} Array of matching member objects
     */
    async searchMembersByName(searchName, options = {}) {
        try {
            const { year, status = 'eligible' } = options;

            // Base SQL query
            let sql = `
        SELECT 
          taxpayer_tin,
          taxpayer_name,
          taxpayer_phone,
          taxpayer_email,
          official_representative,
          representative_phone,
          fiscal_year,
          eligible_for_quitus,
          is_active
        FROM 
          psf_members
        WHERE 
          taxpayer_name LIKE ?
      `;

            // Prepare parameters array
            const params = [`%${searchName}%`];

            // Add status filters based on option
            if (status === 'eligible') {
                sql += ` AND is_active = TRUE AND eligible_for_quitus = 'Yes'`;
            } else if (status === 'active') {
                sql += ` AND is_active = TRUE`;
            }
            // 'all' status means no additional filters

            // Add year filter if provided
            if (year) {
                sql += ` AND fiscal_year = ?`;
                params.push(year);
            }

            // Order by name for better readability
            sql += ` ORDER BY taxpayer_name ASC`;

            const [rows] = await db.query(sql, params);
            return rows;

        } catch (error) {
            console.error('[Model Error - searchMembersByName]:', error);
            throw error;
        }
    }

};

module.exports = RRAIntegrationModel;