// controllers/locationController.js
const LocationModel = require('../models/locationModel');

class LocationController {
  /**
   * API endpoint to get districts by province ID
   */
  static async getDistrictsByProvince(req, res) {
    try {
      const { provinceId } = req.params;
      
      if (!provinceId) {
        return res.status(400).json({ error: 'Province ID is required' });
      }
      
      const districts = await LocationModel.getDistrictsByProvince(provinceId);
      res.json(districts);
    } catch (error) {
      console.error('Error fetching districts:', error);
      res.status(500).json({ error: 'Failed to fetch districts' });
    }
  }

  /**
   * API endpoint to get sectors by district ID
   */
  static async getSectorsByDistrict(req, res) {
    try {
      const { districtId } = req.params;
      
      if (!districtId) {
        return res.status(400).json({ error: 'District ID is required' });
      }
      
      const sectors = await LocationModel.getSectorsByDistrict(districtId);
      res.json(sectors);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      res.status(500).json({ error: 'Failed to fetch sectors' });
    }
  }

  /**
   * API endpoint to get cells by sector ID
   */
  static async getCellsBySector(req, res) {
    try {
      const { sectorId } = req.params;
      
      if (!sectorId) {
        return res.status(400).json({ error: 'Sector ID is required' });
      }
      
      const cells = await LocationModel.getCellsBySector(sectorId);
      res.json(cells);
    } catch (error) {
      console.error('Error fetching cells:', error);
      res.status(500).json({ error: 'Failed to fetch cells' });
    }
  }

  /**
   * API endpoint to get villages by cell ID
   */
  static async getVillagesByCell(req, res) {
    try {
      const { cellId } = req.params;
      
      if (!cellId) {
        return res.status(400).json({ error: 'Cell ID is required' });
      }
      
      const villages = await LocationModel.getVillagesByCell(cellId);
      res.json(villages);
    } catch (error) {
      console.error('Error fetching villages:', error);
      res.status(500).json({ error: 'Failed to fetch villages' });
    }
  }

  /**
   * Handle form submission and save selected location
   */
  static async handleFormSubmission(req, res) {
    try {
      const { province, district, sector, cell, village } = req.body;
      
      // Validate required fields
      if (!province || !district || !sector || !cell || !village) {
        return res.status(400).send('All location fields are required');
      }
      
      // Here you would typically save this data to another table or process it
      // For example:
      // await SomeModel.saveLocationSelection({ province, district, sector, cell, village });
      
      // For demonstration, just render the success page with selected IDs
      res.render('submission-success', {
        selectedLocation: {
          province_id: province,
          district_id: district,
          sector_id: sector,
          cell_id: cell,
          village_id: village
        },
        pageTitle: 'Submission Successful'
      });
    } catch (error) {
      console.error('Error processing form submission:', error);
      res.status(500).send('Error processing your submission. Please try again.');
    }
  }
  
  /**
   * API endpoint to get location names by IDs (optional utility method)
   * This can be used to fetch location names for all selected IDs at once
   */
  static async getLocationNames(req, res) {
    try {
      const { provinceId, districtId, sectorId, cellId, villageId } = req.query;
      
      // Validate parameters
      if (!provinceId || !districtId || !sectorId || !cellId || !villageId) {
        return res.status(400).json({ error: 'All location IDs are required' });
      }
      
      // Execute parallel queries for better performance
      const [
        [provinceResult], 
        [districtResult], 
        [sectorResult], 
        [cellResult], 
        [villageResult]
      ] = await Promise.all([
        pool.query('SELECT province_name FROM provinces WHERE province_id = ?', [provinceId]),
        pool.query('SELECT district_name FROM districts WHERE district_id = ?', [districtId]),
        pool.query('SELECT sector_name FROM sectors WHERE sector_id = ?', [sectorId]),
        pool.query('SELECT cell_name FROM cells WHERE cell_id = ?', [cellId]),
        pool.query('SELECT village_name FROM villages WHERE village_id = ?', [villageId])
      ]);
      
      // Return the location names
      res.json({
        province: provinceResult?.[0]?.province_name || null,
        district: districtResult?.[0]?.district_name || null,
        sector: sectorResult?.[0]?.sector_name || null,
        cell: cellResult?.[0]?.cell_name || null,
        village: villageResult?.[0]?.village_name || null
      });
    } catch (error) {
      console.error('Error fetching location names:', error);
      res.status(500).json({ error: 'Failed to fetch location names' });
    }
  }
}

module.exports = LocationController;