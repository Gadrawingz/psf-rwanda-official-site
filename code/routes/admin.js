const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// --- Applicant Routes ---

// GET /admin/applicants - View all applicants (with optional filtering)
router.get('/applicants', adminController.viewApplicants);

// --- Feedback/Notification Routes ---

// GET /admin/feedback - Show the feedback/notification form
router.get('/feedback', adminController.showFeedbackForm);
// POST /admin/feedback/send - Send feedback/notifications (Email/SMS)
router.post('/feedback/send', adminController.sendFeedback);

// --- Export Routes ---

// GET /admin/export/excel - Export applicants data to Excel
router.get('/export/excel', adminController.exportExcel);
// GET /admin/export/pdf - Export applicants data to PDF
router.get('/export/pdf', adminController.exportPDF);

module.exports = router;