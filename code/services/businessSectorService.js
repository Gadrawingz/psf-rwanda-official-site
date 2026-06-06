const BusinessSector = require('../models/businessSector');

class BusinessSectorService {
  /**
   * Get all business sectors
   * @returns {Promise<Array>} Array of business sectors
   */
  static async getAllSectors() {
    return await BusinessSector.getAll();
  }

  /**
   * Get a single business sector by ID
   * @param {number} id - The business sector ID
   * @returns {Promise<Object>} The business sector
   * @throws {Error} If sector not found
   */
  static async getSectorById(id) {
    const sector = await BusinessSector.getById(id);
    if (!sector) {
      const error = new Error('Business sector not found');
      error.statusCode = 404;
      throw error;
    }
    return sector;
  }

  /**
   * Create a new business sector
   * @param {Object} sectorData - The business sector data
   * @returns {Promise<Object>} The created business sector
   */
  static async createSector(sectorData) {
    return await BusinessSector.create(sectorData);
  }

  /**
   * Update a business sector
   * @param {number} id - The business sector ID
   * @param {Object} sectorData - The business sector data
   * @returns {Promise<Object>} The updated business sector
   * @throws {Error} If sector not found or update fails
   */
  static async updateSector(id, sectorData) {
    // Check if sector exists
    await this.getSectorById(id);
    
    const updated = await BusinessSector.update(id, sectorData);
    if (!updated) {
      const error = new Error('Failed to update business sector');
      error.statusCode = 500;
      throw error;
    }
    
    return await this.getSectorById(id);
  }

  /**
   * Delete a business sector
   * @param {number} id - The business sector ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If sector not found or delete fails
   */
  static async deleteSector(id) {
    // Check if sector exists
    await this.getSectorById(id);
    
    const deleted = await BusinessSector.delete(id);
    if (!deleted) {
      const error = new Error('Failed to delete business sector');
      error.statusCode = 500;
      throw error;
    }
    
    return true;
  }
}

module.exports = BusinessSectorService;