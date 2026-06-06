// controllers/associationController.js
const Association = require('../models/Association');

class AssociationController {
  // Get all associations for API
  static async getAssociations(req, res) {
    try {
      const associations = await Association.getAllAssociations();
      res.json({
        success: true,
        data: associations
      });
    } catch (error) {
      console.error('Error in getAssociations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch associations'
      });
    }
  }

  // Get single association
  static async getAssociation(req, res) {
    try {
      const { id } = req.params;
      const association = await Association.getAssociationById(id);
      
      if (!association) {
        return res.status(404).json({
          success: false,
          message: 'Association not found'
        });
      }

      res.json({
        success: true,
        data: association
      });
    } catch (error) {
      console.error('Error in getAssociation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch association'
      });
    }
  }
}

module.exports = AssociationController;