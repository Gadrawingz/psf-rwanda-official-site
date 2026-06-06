const pool = require('../config/database');

class LocationModel {

  // Get all provinces
  static async getAllProvinces() {
    try {
      const [rows] = await pool.query('SELECT province_id, province_name FROM provinces ORDER BY province_name');
      return rows;
      //console.log(rows);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  // Get districts by province
  static async getDistrictsByProvince(provinceId) {
    try {
      const [rows] = await pool.query(
        'SELECT district_id, district_name FROM districts WHERE province_id = ? ORDER BY district_name',
        [provinceId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  // Get sectors by district
  static async getSectorsByDistrict(districtId) {
    try {
      const [rows] = await pool.query(
        'SELECT sector_id, sector_name FROM sectors WHERE district_id = ? ORDER BY sector_name',
        [districtId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching sectors:', error);
      throw error;
    }
  }

  // Get cells by sector
  static async getCellsBySector(sectorId) {
    try {
      const [rows] = await pool.query(
        'SELECT cell_id, cell_name FROM cells WHERE sector_id = ? ORDER BY cell_name',
        [sectorId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching cells:', error);
      throw error;
    }
  }

  // Get villages by cell
  static async getVillagesByCell(cellId) {
    try {
      const [rows] = await pool.query(
        'SELECT village_id, village_name FROM villages WHERE cell_id = ? ORDER BY village_name',
        [cellId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching villages:', error);
      throw error;
    }
  }
}

module.exports = LocationModel;