const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

// GET / - Show the initial application form
router.get('/', applicantController.showForm);

// POST /applicants/submit - Submit the application data
router.post('/submit', applicantController.submitApplication);

module.exports = router;