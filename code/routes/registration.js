const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// POST /dummy-api/registrations - Create registration
router.post('/registrations', registrationController.create);

// GET /dummy-api/registrations - Get all registrations
router.get('/registrations', registrationController.getAll);

// DELETE /dummy-api/registrations/:id - Delete registration
router.delete('/registrations/:id', registrationController.delete);

module.exports = router;