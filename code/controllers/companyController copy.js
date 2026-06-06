const CompanyModel = require('../models/companyModel');
const LocationModel = require('../models/locationModel');
const formHelpers = require('../utils/formHelpers');
const CompanyValidation = require('../middleware/companyValidation');

const companyController = {
    // Display list of all companies
    index: async (req, res) => {
        try {
            let companies;
            const searchTerm = req.query.search;

            if (searchTerm) {
                companies = await CompanyModel.search(searchTerm);
            } else {
                companies = await CompanyModel.findAll(req.session.in_user.user_id);
            }

            const provinces = await LocationModel.getAllProvinces();

            const internals = {
                title: "Companies",
                breadcrumbL1: "Company",
                breadcrumbL2: "Home",
                inUser: req.session.in_user
            };

            res.render("admin/company/index", {
                layout: "./layouts/LAdmin",
                internals,
                companies,
                provinces,
                searchTerm,
                // Flash messages
                success: req.flash('success'),
                error: req.flash('error')
            });

        } catch (error) {
            console.error('Error fetching companies:', error);
            req.flash('error', 'Failed to fetch companies');
            res.redirect('/dashboard');
        }
    },

    // Display form to create new company
    create: async (req, res) => {
        try {
            const provinces = await LocationModel.getAllProvinces();
            const internals = {
                title: "Create Company",
                breadcrumbL1: "Company", 
                breadcrumbL2: "Home",
                inUser: req.session.in_user
            };
    
            // Get old form data and errors from flash
            const oldData = req.flash('old')[0] || {};
            const errors = {};
            
            // Collect all error flash messages
            const flashKeys = Object.keys(req.flash());
            flashKeys.forEach(key => {
                if (key.startsWith('error_')) {
                    const fieldName = key.replace('error_', '');
                    errors[fieldName] = req.flash(key);
                }
            });
    
            res.render("admin/company/create", {
                layout: "./layouts/LAdmin",
                internals,
                provinces,
                oldData,
                errors,
                error: req.flash('error'),
                success: req.flash('success'),
                // Add helper functions
                old: formHelpers.old,
                hasError: formHelpers.hasError,
                errorClass: formHelpers.errorClass,
                selected: formHelpers.selected,
                checked: formHelpers.checked
            });
        } catch (error) {
            console.error('Error loading create form:', error);
            req.flash('error', 'Failed to load company creation form');
            res.redirect('/companies');
        }
    },

    // Handle company creation with validation
    store: [
        // Apply validation middleware
        ...CompanyValidation.getValidationRules(),
        CompanyValidation.handleValidationErrors(), // This now uses flash messages

        async (req, res) => {
            try {
                // Use normalized phone numbers from validation
                const companyData = {
                    company_tin: req.body.company_tin,
                    registration_type: req.body.registration_type,
                    registration_number: req.body.registration_number,
                    company_name: req.body.company_name,
                    company_phone: req.normalizedPhone || req.body.company_phone,
                    company_email: req.body.company_email,
                    company_website: req.body.company_website,
                    business_activity: req.body.business_activity,
                    business_size: req.body.business_size,
                    company_type_id: req.body.company_type_id,
                    ownership_id: req.body.ownership_id,
                    permanent_employees: req.body.permanent_employees,
                    casual_employees: req.body.casual_employees,
                    has_association: req.body.has_association,
                    association_id: req.body.association_id || null,
                    district_id: req.body.district_id,
                    sector_id: req.body.sector_id,
                    cell_id: req.body.cell_id,
                    village_id: req.body.village_id,
                    street_zone: req.body.street_zone,
                    financial_system: req.body.financial_system,
                    membership_category: req.body.membership_category,
                    membership_status: req.body.membership_status,
                    business_scope: req.body.business_scope,
                    local_places: req.body.local_places,
                    int_countries: req.body.int_countries,
                };

                const representativeData = {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    gender: req.body.gender,
                    telephone: req.normalizedRepPhone || req.body.telephone,
                    rep_email: req.body.rep_email,
                    national_id: req.body.national_id,
                    passport_number: req.body.passport_number,
                    birthday: req.body.birthday,
                    has_insurance: req.body.has_insurance,
                    preferred_language: req.body.preferred_language,
                    areas_of_interest: req.body.areas_of_interest,
                    registered_by: req.session.in_user.user_id
                };

                const companyId = await CompanyModel.create(companyData, representativeData);
                req.flash('success', 'Company registered successfully!');
                res.redirect(`/companies/${companyId}`);

            } catch (error) {
                console.error('Error creating company:', error);

                // Store form data to repopulate the form
                req.flash('old', req.body);
                req.flash('error', 'Failed to create company. Please check your information and try again.');
                res.redirect('/companies/create');
            }
        }
    ],

    // Display company details
    show: async (req, res) => {
        try {
            const company = await CompanyModel.findById(req.params.id);

            if (!company) {
                req.flash('error', 'Company not found');
                return res.redirect('/companies');
            }

            const internals = {
                title: "Company Details",
                breadcrumbL1: "Company",
                breadcrumbL2: "Details",
                inUser: req.session.in_user
            };

            res.render("admin/company/show", {
                layout: "./layouts/LAdmin",
                internals,
                company,
                success: req.flash('success'),
                error: req.flash('error')
            });

        } catch (error) {
            console.error('Error fetching company:', error);
            req.flash('error', 'Failed to fetch company details');
            res.redirect('/companies');
        }
    },

    // Handle company deletion
    delete: async (req, res) => {
        try {
            const deleted = await CompanyModel.delete(req.params.id);

            if (!deleted) {
                req.flash('error', 'Company not found or could not be deleted');
            } else {
                req.flash('success', 'Company deleted successfully');
            }

            res.redirect('/companies/all');
        } catch (error) {
            console.error('Error deleting company:', error);
            req.flash('error', 'Failed to delete company');
            res.redirect('/companies/all');
        }
    }
};

module.exports = companyController;