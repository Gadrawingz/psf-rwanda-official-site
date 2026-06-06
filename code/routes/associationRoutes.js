// routes/associationRoutes.js
const express = require('express');
const router = express.Router();
const AssociationController = require('../controllers/associationController');

// GET /api/associations - Get all associations
router.get('/', AssociationController.getAssociations);

// GET /api/associations/:id - Get single association
router.get('/:id', AssociationController.getAssociation);

module.exports = router;