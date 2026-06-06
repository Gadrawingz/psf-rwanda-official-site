/****************************************
 * This route is expected to handle all routes related to membership
 * Including businessSector, membershipCategories, subCategories, etc.
 * *************************************/
const express = require('express');
const router = express.Router();
const businessSectorController = require('../controllers/businessSectorController');

// 1. Business sector routes
router.get('/all', businessSectorController.getAllSectors);
router.get('/create', businessSectorController.createSectorForm);
router.post('/create', businessSectorController.createSector);
//router.get('/:id', companyController.show);
//router.get('/:id/edit', companyController.edit);
//router.put('/:id', companyController.update);
router.delete('/delete/:id', businessSectorController.deleteSector);
module.exports = router;