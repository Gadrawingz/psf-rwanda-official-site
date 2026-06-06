const Applicant = require('../models/Applicant');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// --- View Applicants Controller ---

exports.viewApplicants = async (req, res) => {
    try {
        const { level, position } = req.query;
        let applicants;

        if (level && position) {
            applicants = await Applicant.findByLevelAndPosition(level, position);
        } else if (level) {
            applicants = await Applicant.findByElectionLevel(level);
        } else {
            applicants = await Applicant.findAll();
        }

        const stats = await Applicant.getStatsByLevel();

        const internals = {
            title: "VIEW APPLICANTS - PSF",
            breadcrumbL1: "Admin",
            breadcrumbL2: "🗳️ PSF 2025 Election - Dashboard",
            inUser: req.session.in_user
        };                
    
        res.render("admin/applicant/applicants", {
            layout: "./layouts/LAdmin",
            internals,
            applicants,
            stats,
            selectedLevel: level || '',
            selectedPosition: position || ''
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading applicants');
    }
};

// --- Show Feedback Form Controller ---

exports.showFeedbackForm = async (req, res) => {
    try {
        const applicants = await Applicant.findAll();
        const stats = await Applicant.getStatsByLevel();
        
        const internals = {
            title: "SEND FEEDBACK - PSF",
            breadcrumbL1: "Admin",
            breadcrumbL2: "🗳️ PSF 2025 Election - Feedback",
            inUser: req.session.in_user
        };
    
        res.render("admin/applicant/feedback", {
            layout: "./layouts/LAdmin",
            internals,
            applicants,
            stats
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading feedback form');
    }
};

// --- Send Feedback Controller ---

exports.sendFeedback = async (req, res) => {
    try {
        const {
            filter_type,
            election_level,
            position_role,
            chamber,
            province,
            district,
            is_member,
            recipient_ids,
            method,
            subject,
            message
        } = req.body;

        let recipients = [];

        if (filter_type === 'all') {
            recipients = await Applicant.findAll();
        } else if (filter_type === 'filter') {
            const filters = {
                election_level,
                position_role,
                chamber_selected: chamber,
                province_selected: province,
                district_selected: district,
                is_member
            };
            recipients = await Applicant.searchApplicants(filters);
        } else if (filter_type === 'specific' && recipient_ids) {
            const ids = Array.isArray(recipient_ids) ? recipient_ids : [recipient_ids];
            for (const id of ids) {
                const applicant = await Applicant.findById(id);
                if (applicant) recipients.push(applicant);
            }
        }

        if (method === 'email') {
            console.log('=== EMAIL NOTIFICATION ===');
            console.log('To:', recipients.map(r => r.email).filter(e => e));
            console.log('Subject:', subject);
            console.log('Message:', message);
            console.log('Total Recipients:', recipients.length);
        } else if (method === 'sms') {
            console.log('=== SMS NOTIFICATION via InTouch API ===');
            console.log('/* INTEGRATION PLACEHOLDER */');
            console.log('/* Add InTouch SMS Gateway Integration Here */');
            console.log('const smsConfig = {');
            console.log('  apiUrl: "https://www.intouchsms.co.rw/api/sendsms/.json",');
            console.log('  username: "YOUR_USERNAME",');
            console.log('  password: "YOUR_PASSWORD",');
            console.log('  sender: "PSF"');
            console.log('};');
            console.log('');
            console.log('const phoneNumbers = [');
            recipients.forEach(r => console.log(`  "${r.phone_number}",`));
            console.log('];');
            console.log('Message:', message);
            console.log('Total Recipients:', recipients.length);
        }

        const internals = {
            title: "FEEDBACK SUCCESS - PSF",
            breadcrumbL1: "PSF",
            breadcrumbL2: "",
            inUser: req.session.in_user
        };
    
        res.render("admin/applicant/feedback_success", {
            layout: "./layouts/LAdmin",
            internals,
            method,
            count: recipients.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending feedback');
    }
};

// --- Export Excel Controller ---

exports.exportExcel = async (req, res) => {
    try {
        const { level, position } = req.query;
        let applicants, filename;

        if (level && position) {
            applicants = await Applicant.findByLevelAndPosition(level, position);
            filename = `PSF_Applicants_${level}_${position}_${Date.now()}.xlsx`;
        } else if (level) {
            applicants = await Applicant.findByElectionLevel(level);
            filename = `PSF_Applicants_${level}_${Date.now()}.xlsx`;
        } else {
            applicants = await Applicant.findAll();
            filename = `PSF_All_Applicants_${Date.now()}.xlsx`;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Applicants');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'First Name', key: 'firstname', width: 15 },
            { header: 'Last Name', key: 'lastname', width: 15 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'National ID', key: 'national_id', width: 20 },
            { header: 'Company Name', key: 'company_name', width: 25 },
            { header: 'TIN Number', key: 'tin_number', width: 15 },
            { header: 'Ownership', key: 'full_ownership', width: 12 },
            { header: 'Years in Business', key: 'years_in_business', width: 18 },
            { header: 'Phone', key: 'phone_number', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Member', key: 'is_member', width: 10 },
            { header: 'Membership Type', key: 'membership_type', width: 18 },
            { header: 'Election Level', key: 'election_level', width: 15 },
            { header: 'Position', key: 'position_role', width: 25 },
            { header: 'Chamber', key: 'chamber_selected', width: 15 },
            { header: 'Province', key: 'province_selected', width: 15 },
            { header: 'District', key: 'district_selected', width: 15 },
            { header: 'Applied Date', key: 'created_at', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2ECC71' } };

        applicants.forEach(a => {
            worksheet.addRow({ ...a, created_at: new Date(a.created_at).toLocaleString() });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error exporting to Excel');
    }
};

// --- Export PDF Controller ---

exports.exportPDF = async (req, res) => {
    try {
        const { level, position } = req.query;
        let applicants, filename;

        if (level && position) {
            applicants = await Applicant.findByLevelAndPosition(level, position);
            filename = `PSF_Applicants_${level}_${position}_${Date.now()}.pdf`;
        } else if (level) {
            applicants = await Applicant.findByElectionLevel(level);
            filename = `PSF_Applicants_${level}_${Date.now()}.pdf`;
        } else {
            applicants = await Applicant.findAll();
            filename = `PSF_All_Applicants_${Date.now()}.pdf`;
        }

        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        doc.fontSize(18).fillColor('#2ECC71').text('PSF 2025 Election - Applicants Report', { align: 'center' });
        doc.moveDown();

        if (level) {
            doc.fontSize(12).fillColor('#000').text(`Election Level: ${level}${position ? ' - ' + position : ''}`, { align: 'center' });
        }
        doc.moveDown();

        doc.fontSize(10).fillColor('#000');

        const tableTop = doc.y;
        const colWidth = 70;
        let y = tableTop;

        // Table Headers
        doc.font('Helvetica-Bold');
        doc.text('Name', 50, y, { width: colWidth, continued: false });
        doc.text('National ID', 50 + colWidth, y, { width: colWidth, continued: false });
        doc.text('Company', 50 + colWidth * 2, y, { width: colWidth, continued: false });
        doc.text('Phone', 50 + colWidth * 3, y, { width: colWidth, continued: false });
        doc.text('Position', 50 + colWidth * 4, y, { width: colWidth, continued: false });
        doc.text('Level', 50 + colWidth * 5, y, { width: colWidth, continued: false });
        doc.text('Member', 50 + colWidth * 6, y, { width: 60, continued: false });
        y += 20;

        // Table Rows
        doc.font('Helvetica');
        applicants.forEach((a, idx) => {
            if (y > 520) { // Check for page break
                doc.addPage();
                y = 50;
                // Re-print headers on new page
                doc.font('Helvetica-Bold');
                doc.text('Name', 50, y, { width: colWidth, continued: false });
                doc.text('National ID', 50 + colWidth, y, { width: colWidth, continued: false });
                doc.text('Company', 50 + colWidth * 2, y, { width: colWidth, continued: false });
                doc.text('Phone', 50 + colWidth * 3, y, { width: colWidth, continued: false });
                doc.text('Position', 50 + colWidth * 4, y, { width: colWidth, continued: false });
                doc.text('Level', 50 + colWidth * 5, y, { width: colWidth, continued: false });
                doc.text('Member', 50 + colWidth * 6, y, { width: 60, continued: false });
                y += 20;
                doc.font('Helvetica');
            }

            doc.fontSize(8);
            doc.text(`${a.firstname} ${a.lastname}`.substring(0, 15), 50, y, { width: colWidth, continued: false });
            doc.text(a.national_id.substring(0, 12), 50 + colWidth, y, { width: colWidth, continued: false });
            doc.text(a.company_name.substring(0, 15), 50 + colWidth * 2, y, { width: colWidth, continued: false });
            doc.text(a.phone_number, 50 + colWidth * 3, y, { width: colWidth, continued: false });
            doc.text(a.position_role.substring(0, 20), 50 + colWidth * 4, y, { width: colWidth, continued: false });
            doc.text(a.election_level, 50 + colWidth * 5, y, { width: colWidth, continued: false });
            doc.text(a.is_member, 50 + colWidth * 6, y, { width: 60, continued: false });
            y += 15;
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error exporting to PDF');
    }
};