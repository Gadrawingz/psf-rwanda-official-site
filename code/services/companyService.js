const pool = require('../config/database');

class CompanyService {
  
  // Check if phone number exists
  static async checkPhoneExists(phone, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_companies WHERE company_phone = ?';
      let params = [phone];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking phone existence:', error);
      throw error;
    }
  }

  // Check if representative phone exists
  static async checkRepPhoneExists(phone, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_representatives WHERE telephone = ?';
      let params = [phone];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking representative phone existence:', error);
      throw error;
    }
  }

  // Check if email exists
  static async checkEmailExists(email, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_companies WHERE company_email = ?';
      let params = [email];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  // Check if representative email exists
  static async checkRepEmailExists(email, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_representatives WHERE email = ?';
      let params = [email];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking representative email existence:', error);
      throw error;
    }
  }

  // Check if National ID exists
  static async checkNationalIdExists(nationalId, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_representatives WHERE national_id = ?';
      let params = [nationalId];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking National ID existence:', error);
      throw error;
    }
  }

  // Check if passport exists  
  static async checkPassportExists(passport, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_representatives WHERE passport_number = ?';
      let params = [passport];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking passport existence:', error);
      throw error;
    }
  }

  // Check if TIN exists
  static async checkTINExists(tin, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM membership_companies WHERE company_tin = ?';
      let params = [tin];
      
      if (excludeId) {
        query += ' AND company_id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking TIN existence:', error);
      throw error;
    }
  }
}

module.exports = CompanyService;