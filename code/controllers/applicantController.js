const Applicant = require('../models/Applicant');
const path = require('path');
const fs = require('fs');

const districts = [
    'Bugesera', 'Burera', 'Gakenke', 'Gasabo', 'Gatsibo', 'Gicumbi',
    'Gisagara', 'Huye', 'Kamonyi', 'Karongi', 'Kayonza', 'Kicukiro',
    'Kirehe', 'Muhanga', 'Musanze', 'Ngoma', 'Ngororero', 'Nyabihu',
    'Nyagatare', 'Nyamagabe', 'Nyamasheke', 'Nyanza', 'Nyarugenge',
    'Nyaruguru', 'Rubavu', 'Ruhango', 'Rulindo', 'Rusizi', 'Rutsiro',
    'Rwamagana'
];

exports.showForm = (req, res) => {
    const internals = {
        title: "PSF 2025 - ELECTION 2025",
        breadcrumbL1: "PSF",
        breadcrumbL2: "APPLICATIONS",
        inUser: req.session.in_user
    };

    res.render("app-form", {
        layout: "./layouts/LClients",
        internals,
        districts
    });

};

exports.submitApplication = async (req, res) => {
    try {
        // Ensure the 'uploads' directory exists
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }

        // Extract files from request
        const nidPhoto = req.files?.nid_photo;
        const membershipCard = req.files?.membership_card;
        const cvResume = req.files?.cv_resume;
        const otherDoc = req.files?.other_document;

        // Basic validation
        if (!cvResume) {
            return res.status(400).json({
                error: 'CV/Resume is required'
            });
        }

        if (cvResume.mimetype !== 'application/pdf') {
            return res.status(400).json({
                error: 'CV must be PDF format'
            });
        }

        if (otherDoc && otherDoc.mimetype !== 'application/pdf') {
            return res.status(400).json({
                error: 'Other document must be PDF format'
            });
        }

        // Initialize paths
        let nidPath = null,
            membershipPath = null,
            otherPath = null;

        // Move CV/Resume (Required)
        const cvPath = `uploads/${Date.now()}_cv_${cvResume.name}`;
        await cvResume.mv(cvPath);

        // Move optional files
        if (nidPhoto) {
            nidPath = `uploads/${Date.now()}_nid_${nidPhoto.name}`;
            await nidPhoto.mv(nidPath);
        }

        if (membershipCard) {
            membershipPath = `uploads/${Date.now()}_membership_${membershipCard.name}`;
            await membershipCard.mv(membershipPath);
        }

        if (otherDoc) {
            otherPath = `uploads/${Date.now()}_other_${otherDoc.name}`;
            await otherDoc.mv(otherPath);
        }

        // Prepare data for database
        const data = {
            ...req.body,
            nid_photo: nidPath,
            membership_card: membershipPath,
            cv_resume: cvPath,
            other_document: otherPath
        };

        // Create new applicant record
        await Applicant.create(data);

        // Success response
        res.json({
            success: true,
            message: 'Application submitted successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error submitting application'
        });
    }
};