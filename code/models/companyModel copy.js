const pool = require('../config/database');

// Company Model
class CompanyModel {

  // Generate a unique ID @returns {string} - 8-digit unique ID
  async generateUniqueId() {
    try {
      // Generate a random 8-digit number
      const generateId = () => {
        const id = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
        return id;
      };

      let uniqueId = generateId();
      let maxAttempts = 10;
      let attempts = 0;

      // Keep trying until we find a unique ID or reach max attempts
      while (attempts < maxAttempts) {
        // Check if ID exists in database
        const [rows] = await pool.query(
          'SELECT COUNT(*) as count FROM membership_companies WHERE unique_id = ?',
          [uniqueId]
        );
        
        if (rows[0].count === 0) {
          // console.log('Found unique ID:', uniqueId);
          return uniqueId;
        }
        // console.log('ID already exists, generating new one...');
        uniqueId = generateId();
        attempts++;
      }
      // If we reach here, it means we couldn't find a unique ID
      throw new Error('Could not generate unique ID after maximum attempts');
    } catch (error) {
      console.error('Error generating unique ID:', error.message);
      throw error;
    }
  }
  
  // Find all companies
  static async findAll(userId) {

    try {
        const [rows] = await pool.query(`
          SELECT c.*, vl.village_name, cl.cell_name, sc.sector_name, d.district_name, p.province_name, ass.assoc_name, ass.leader_name, ass.leader_position, cr.cluster_name, ct.type_name AS company_type, mo.ownership_name, r.member_id, r.firstname, r.lastname, r.gender, r.birthday, r.telephone as rep_telephone, r.email as rep_email, r.national_id, r.passport_number, r.has_insurance, r.preferred_language, r.areas_of_interest, r.is_approved, r.registered_by, mc.category_name FROM membership_companies c LEFT JOIN membership_representatives r ON c.company_id = r.company_id LEFT JOIN associations ass ON ass.assoc_id= c.association_id LEFT JOIN clusters cr ON cr.cluster_id = ass.cluster_id LEFT JOIN membership_co_types ct ON ct.type_id = c.company_type_id LEFT JOIN membership_ownerships mo ON mo.ownership_id = c.ownership_id LEFT JOIN membership_categories mc ON mc.category_id = c.membership_category LEFT JOIN villages vl ON vl.village_id = c.village_id LEFT JOIN cells cl ON cl.cell_id = c.cell_id LEFT JOIN sectors sc ON sc.sector_id = c.sector_id LEFT JOIN districts d ON c.district_id = d.district_id LEFT JOIN provinces p ON d.province_id = p.province_id WHERE r.registered_by = ? ORDER BY c.created_at DESC LIMIT 100`, [userId]);
      return rows;
    } catch (error) {
      console.error('Error in CompanyModel for finding', error.message);
    }
  }

  // Find company by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, vl.village_name, cl.cell_name, sc.sector_name, d.district_name, p.province_name, ass.assoc_name, ass.leader_name, ass.leader_position, cr.cluster_name, ct.type_name AS company_type, mo.ownership_name, r.member_id, r.firstname, r.lastname, r.gender, r.birthday, r.telephone as rep_telephone, r.email as rep_email, r.national_id, r.passport_number, r.has_insurance, r.preferred_language, r.areas_of_interest, r.is_approved, r.registered_by, mc.category_name FROM membership_companies c LEFT JOIN membership_representatives r ON c.company_id = r.company_id LEFT JOIN associations ass ON ass.assoc_id= c.association_id LEFT JOIN clusters cr ON cr.cluster_id = ass.cluster_id LEFT JOIN membership_co_types ct ON ct.type_id = c.company_type_id LEFT JOIN membership_ownerships mo ON mo.ownership_id = c.ownership_id LEFT JOIN membership_categories mc ON mc.category_id = c.membership_category LEFT JOIN villages vl ON vl.village_id = c.village_id LEFT JOIN cells cl ON cl.cell_id = c.cell_id LEFT JOIN sectors sc ON sc.sector_id = c.sector_id LEFT JOIN districts d ON c.district_id = d.district_id LEFT JOIN provinces p ON d.province_id = p.province_id WHERE c.company_id = ?`, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in model for finding', error.message);
    }
  }



  // Create new company and representative
  static async create(companyData, representativeData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert company data
      const [companyResult] = await connection.query(`
        INSERT INTO membership_companies(company_tin, registration_type, registration_number, company_name, company_phone, company_email, company_website, business_activity, business_size, company_type_id, ownership_id, permanent_employees, casual_employees, has_association, association_id, assoc_contributor, district_id, sector_id, cell_id, village_id, street_zone, sales_reporting, membership_category, membership_status, business_scope, int_countries, local_places) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [
        companyData.company_tin,
        companyData.registration_type,
        companyData.registration_number,
        companyData.company_name,
        companyData.company_phone,
        companyData.company_email,
        companyData.company_website,
        companyData.business_activity,
        companyData.business_size,
        companyData.company_type_id,
        companyData.ownership_id,
        companyData.permanent_employees,
        companyData.casual_employees,
        companyData.has_association,
        companyData.association_id,
        companyData.assoc_contributor,
        companyData.district_id,
        companyData.sector_id,
        companyData.cell_id,
        companyData.village_id,
        companyData.street_zone,
        companyData.sales_reporting,
        companyData.membership_category,
        companyData.membership_status,
        companyData.business_scope,
        companyData.int_countries,
        companyData.local_places
      ]);
      
      const companyId = companyResult.insertId;
    
      // Insert representative data
      await connection.query(`
        INSERT INTO membership_representatives(company_id, firstname, lastname, gender, telephone, email, national_id, passport_number, birthday, has_insurance, preferred_language, areas_of_interest, registered_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        companyId,
        representativeData.firstname,
        representativeData.lastname,
        representativeData.gender,
        representativeData.telephone,
        representativeData.rep_email,
        representativeData.national_id,
        representativeData.passport_number,
        representativeData.birthday,
        representativeData.has_insurance,
        representativeData.preferred_language,
        representativeData.areas_of_interest,
        representativeData.registered_by
      ]);

      await connection.commit();
      
      return companyId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Delete company (will cascade delete representatives)
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM membership_companies WHERE company_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in CompanyModel while deleting:', error.message);
    }
  }

  // Search companies
  static async search(term) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, r.member_id, r.firstname, r.lastname, r.gender, r.telephone as rep_telephone, r.email as rep_email, r.national_id FROM membership_companies c LEFT JOIN membership_representatives r ON c.company_id = r.company_id
        WHERE c.company_name LIKE ? OR c.business_activity LIKE ? 
        OR r.firstname LIKE ? r.lastname LIKE ? OR c.sector LIKE ?
      `, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
  
      return rows;
    } catch (error) {
      console.error('Error in CompanyModel while searching:', error.message);
      // throw error;
    }
  }

  // Update company and representative
  // Simple update method for basic company and representative info
  static async updateBasic(companyId, companyData, representativeData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Update company basic information
      const [companyResult] = await connection.query(`
        UPDATE membership_companies 
        SET company_name = ?, 
            company_tin = ?, 
            business_activity = ?, 
            company_phone = ?, 
            company_email = ?, 
            company_website = ?
        WHERE company_id = ?
      `, [
        companyData.company_name,
        companyData.company_tin,
        companyData.business_activity,
        companyData.company_phone,
        companyData.company_email,
        companyData.company_website,
        companyId
      ]);
      
      // Update representative basic information
      const [repResult] = await connection.query(`
        UPDATE membership_representatives 
        SET firstname = ?, 
            lastname = ?, 
            gender = ?, 
            telephone = ?, 
            email = ?, 
            birthday = ?
        WHERE company_id = ?
      `, [
        representativeData.firstname,
        representativeData.lastname,
        representativeData.gender,
        representativeData.telephone,
        representativeData.rep_email,
        representativeData.birthday,
        companyId
      ]);

      await connection.commit();
      
      console.log('Company update result:', companyResult.affectedRows);
      console.log('Representative update result:', repResult.affectedRows);
      
      return companyResult.affectedRows > 0 || repResult.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Error in CompanyModel.updateBasic:', error);
      throw error;
    } finally {
      connection.release();
    }
  }






  // QUITUS RELATED METHODS
  // companyModel.js - Add these methods to your existing CompanyModel class

/**
 * Get active member details by TIN for quitus recommendation
 * @param {string} tin - Company TIN
 * @returns {Object|null} Company details for quitus verification
 */
static async getQuitusMemberByTin(tin) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.company_tin AS taxpayer_tin,
        c.company_name AS taxpayer_name,
        c.company_phone AS taxpayer_phone,
        c.company_email AS taxpayer_email,
        CONCAT(r.firstname, ' ', r.lastname) AS official_representative,
        r.telephone AS representative_phone,
        c.membership_status,
        c.membership_category,
        c.created_at,
        c.updated_at
      FROM membership_companies c
      LEFT JOIN membership_representatives r ON c.company_id = r.company_id
      WHERE c.company_tin = ? 
        AND c.membership_status = 'active'
        AND r.is_approved = 1
      LIMIT 1
    `, [tin]);

    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching quitus member by TIN:', error.message);
    throw error;
  }
}

/**
 * Get all active members for quitus recommendation list
 * @returns {Array} List of active members eligible for quitus
 */
static async getAllActiveQuitusMembers() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.company_tin AS taxpayer_tin,
        c.company_name AS taxpayer_name,
        c.company_phone AS taxpayer_phone,
        c.company_email AS taxpayer_email,
        CONCAT(r.firstname, ' ', r.lastname) AS official_representative,
        r.telephone AS representative_phone,
        c.membership_status,
        c.membership_category,
        c.created_at,
        c.updated_at
      FROM membership_companies c
      LEFT JOIN membership_representatives r ON c.company_id = r.company_id
      WHERE c.membership_status = 'active'
        AND r.is_approved = 1
      ORDER BY c.company_name ASC
    `);

    return rows;
  } catch (error) {
    console.error('Error fetching all active quitus members:', error.message);
    throw error;
  }
}

/**
 * Verify member eligibility for quitus
 * @param {string} tin - Company TIN
 * @returns {Object} Eligibility status and details
 */
static async verifyQuitusEligibility(tin) {
  try {
    const member = await this.getQuitusMemberByTin(tin);
    
    if (!member) {
      return {
        eligible: false,
        reason: 'Member not found or not active'
      };
    }

    // Check if membership is paid for current fiscal year (2025)
    const currentYear = new Date().getFullYear();
    const fiscalYear = currentYear; // You can adjust this logic as needed

    // Assume membership is valid if status is active
    // You may need to add additional checks for payment status
    
    return {
      eligible: true,
      fiscalYear: fiscalYear,
      memberDetails: member
    };
  } catch (error) {
    console.error('Error verifying quitus eligibility:', error.message);
    throw error;
  }
}

/**
 * Log quitus request from RRA
 * @param {string} tin - Company TIN
 * @param {string} requestSource - Source of request (e.g., 'RRA')
 * @returns {number} Log ID
 */
static async logQuitusRequest(tin, requestSource = 'RRA') {
  try {
    const [result] = await pool.query(`
      INSERT INTO quitus_request_logs 
      (company_tin, request_source, request_date) 
      VALUES (?, ?, NOW())
    `, [tin, requestSource]);

    return result.insertId;
  } catch (error) {
    console.error('Error logging quitus request:', error.message);
    // Don't throw error for logging failures
    return null;
  }
}
  
}

module.exports = CompanyModel;