const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Business routes
router.get('/all', companyController.index);
router.get('/member-manual', companyController.manual);
router.get('/create', companyController.create);
router.post('/create', companyController.store);
router.get('/:id', companyController.show);
router.delete('/delete/:id', companyController.delete);

// Simple edit/update routes (2-level to avoid CSS/JS issues)
router.get('/company-edit/:id', companyController.edit);
router.post('/company-update/:id', companyController.update);

module.exports = router;