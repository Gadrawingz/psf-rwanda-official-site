// models/Association.js
const pool = require('../config/database');

class Association {
  // Get all associations
  static async getAllAssociations() {
    try {
      const [rows] = await pool.execute(
        'SELECT a.assoc_id, a.assoc_name, a.leader_name, a.leader_position, c.cluster_id, c.cluster_name FROM associations a LEFT JOIN clusters c ON c.cluster_id = a.cluster_id ORDER BY c.cluster_name ASC'
      );
      return rows;
    } catch (error) {
      console.error('Error fetching associations:', error);
      throw error;
    }
  }

  // Get association by ID
  static async getAssociationById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT a.assoc_id, a.assoc_name, a.leader_name, a.leader_position, c.cluster_id, c.cluster_name FROM associations a LEFT JOIN clusters c ON c.cluster_id = a.cluster_id WHERE a.assoc_id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching association by ID:', error);
      throw error;
    }
  }
}

module.exports = Association;