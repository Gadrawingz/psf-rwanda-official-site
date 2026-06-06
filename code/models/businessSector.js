const pool = require('../config/database');

class BusinessSector {
  /**
   * Get all business sectors
   * @returns {Promise<Array>} Array of business sectors
   */
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM membership_business_sectors ORDER BY sector_name');
    return rows;
  }

  /**
   * Get a single business sector by ID
   * @param {number} id - The business sector ID
   * @returns {Promise<Object|null>} The business sector or null if not found
   */
  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM membership_business_sectors WHERE sector_id = ?', [id]);
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new business sector
   * @param {Object} sector - The business sector data
   * @returns {Promise<Object>} The created business sector
   */
  static async create(sector) {
    const { sector_name, sector_description } = sector;
    const [result] = await pool.query(
      'INSERT INTO membership_business_sectors (sector_name, sector_description) VALUES (?, ?)',
      [sector_name, sector_description]
    );
    
    return { sector_id: result.insertId, sector_name, sector_description };
  }

  /**
   * Update a business sector
   * @param {number} id - The business sector ID
   * @param {Object} sector - The business sector data
   * @returns {Promise<boolean>} True if updated, false otherwise
   */
  static async update(id, sector) {
    const { sector_name, sector_description } = sector;
    const [result] = await pool.query(
      'UPDATE membership_business_sectors SET sector_name = ?, sector_description = ? WHERE sector_id = ?',
      [sector_name, sector_description, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Delete a business sector
   * @param {number} id - The business sector ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM membership_business_sectors WHERE sector_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = BusinessSector;