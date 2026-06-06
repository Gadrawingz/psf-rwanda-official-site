// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');

// API endpoints for cascading dropdowns
router.get('/districts/:provinceId', LocationController.getDistrictsByProvince);
router.get('/sectors/:districtId', LocationController.getSectorsByDistrict);
router.get('/cells/:sectorId', LocationController.getCellsBySector);
router.get('/villages/:cellId', LocationController.getVillagesByCell);

// Optional utility endpoint to get all location names by IDs
router.get('/location-names', LocationController.getLocationNames);

// Handle form submission
router.post('/submit-location', LocationController.handleFormSubmission);

module.exports = router;