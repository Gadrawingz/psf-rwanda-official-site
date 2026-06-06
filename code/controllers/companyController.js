
const CompanyModel = require('../models/companyModel');
const LocationModel = require('../models/locationModel');
const formHelpers = require('../utils/formHelpers');
const CompanyValidation = require('../middleware/companyValidation');

// Helper function to convert empty strings to NULL (inline version if you don't have the utils file)
function emptyStringToNull(value) {
    if (value === '' || value === undefined || value === null) {
        return null;
    }
    return typeof value === 'string' ? value.trim() : value;
}

// Helper function to sanitize identity data
function sanitizeIdentityData(identityData) {
    const { nationality, national_id, passport_number } = identityData;

    let sanitizedNationalId = emptyStringToNull(national_id);
    let sanitizedPassport = emptyStringToNull(passport_number);

    // Ensure only one ID type is set based on nationality
    if (nationality === 'Rwandan') {
        sanitizedPassport = null; // Clear passport for Rwandans
    } else if (nationality === 'Non-Rwandan') {
        sanitizedNationalId = null; // Clear national ID for non-Rwandans
    }

    return {
        nationality,
        national_id: sanitizedNationalId,
        passport_number: sanitizedPassport
    };
}

const companyController = {
    // Display list of all companies
    manual: async (req, res) => {
        try {
            const companies = await CompanyModel.findAll(req.session.in_user.user_id);
            const provinces = await LocationModel.getAllProvinces();
            const internals = {
                title: "Membership Manual",
                breadcrumbL1: "Company",
                breadcrumbL2: "Documents",
                inUser: req.session.in_user
            };
            res.render("admin/company/member-doc", {
                layout: "./layouts/LAdmin",
                internals,
                companies,
                provinces,
                // Flash messages
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error fetching manual doc:', error);
            req.flash('error', 'Failed to fetch data');
            res.redirect('/dashboard');
        }
    },
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
                
                // Sanitize identity data
                const identityData = sanitizeIdentityData({
                    nationality: req.body.nationality,
                    national_id: req.body.national_id,
                    passport_number: req.body.passport_number
                });
                console.log('Sanitized identity data:', identityData);

                // Sanitize association data
                const hasAssociation = req.body.has_association;
                const associationId = (hasAssociation === '1' && req.body.association_id) ? req.body.association_id : null;
                // const asContributor = (req.body.assoc_contributor === '1'

                // Use normalized phone numbers from validation
                const companyData = {
                    company_tin: req.body.company_tin,
                    registration_type: req.body.registration_type,
                    registration_number: (req.body.registration_number === req.body.company_tin) ? null : req.body.registration_number,
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
                    has_association: hasAssociation,
                    association_id: associationId,
                    assoc_contributor: req.body.assoc_contributor,
                    district_id: req.body.district_id,
                    sector_id: req.body.sector_id,
                    cell_id: req.body.cell_id,
                    village_id: req.body.village_id,
                    street_zone: req.body.street_zone,
                    sales_reporting: req.body.sales_reporting,
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
                    national_id: identityData.national_id,
                    passport_number: identityData.passport_number,
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
                return res.redirect('/companies/all');
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


        // Display simple edit form
        edit: async (req, res) => {
            try {
                const company = await CompanyModel.findById(req.params.id);
        
                if (!company) {
                    req.flash('error', 'Company not found');
                    return res.redirect('/companies/all');
                }
    
                // Check if user has permission to edit this company
                if (company.registered_by !== req.session.in_user.user_id) {
                    console.log('You do not have permission to edit this company');
                    req.flash('error', 'You do not have permission to edit this company');
                    return res.redirect('/companies/all');
                }
    
                const internals = {
                    title: "Edit Company",
                    breadcrumbL1: "Company",
                    breadcrumbL2: "Edit",
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
    
                console.log('Editing company:', {
                    id: company.company_id,
                    name: company.company_name,
                    hasOldData: Object.keys(oldData).length > 0
                });
    
                res.render("admin/company/company-edit", {
                    layout: "./layouts/LAdmin",
                    internals,
                    company,
                    oldData,
                    errors,
                    error: req.flash('error'),
                    success: req.flash('success')
                });
            } catch (error) {
                console.error('Error loading edit form:', error);
                req.flash('error', 'Failed to load company edit form');
                res.redirect('/companies/all');
            }
        },
    
        // Handle simple company update
        update: async (req, res) => {
            try {
                const companyId = req.params.id;
                console.log('Updating company ID:', companyId);
    
                // Check if company exists and user has permission
                const existingCompany = await CompanyModel.findById(companyId);
                if (!existingCompany) {
                    req.flash('error', 'Company not found');
                    return res.redirect('/companies/all');
                }
    
                if (existingCompany.registered_by !== req.session.in_user.user_id) {
                    req.flash('error', 'You do not have permission to update this company');
                    return res.redirect('/companies/all');
                }
    
                // Simple validation
                const validationErrors = validateSimpleUpdate(req.body);
                if (validationErrors.length > 0) {
                    // Store form data and errors in flash
                    req.flash('old', req.body);
                    validationErrors.forEach(error => {
                        req.flash(`error_${error.field}`, error.message);
                    });
                    return res.redirect(`/company-edit/${companyId}`);
                }
    
                // Prepare company data for update (only basic fields)
                const companyData = {
                    company_name: req.body.company_name?.trim(),
                    company_tin: req.body.company_tin?.trim(),
                    business_activity: req.body.business_activity?.trim(),
                    company_phone: req.body.company_phone?.trim(),
                    company_email: req.body.company_email?.trim() || null,
                    company_website: req.body.company_website?.trim() || null
                };
    
                // Prepare representative data for update (only basic fields)
                const representativeData = {
                    firstname: req.body.firstname?.trim(),
                    lastname: req.body.lastname?.trim(),
                    gender: req.body.gender,
                    telephone: req.body.telephone?.trim(),
                    rep_email: req.body.rep_email?.trim() || null,
                    birthday: req.body.birthday
                };
    
                console.log('Updating company with data:', companyData);
                console.log('Updating representative with data:', representativeData);
    
                // Perform the update using simplified model method
                const updated = await CompanyModel.updateBasic(companyId, companyData, representativeData);
    
                if (updated) {
                    req.flash('success', 'Company information updated successfully!');
                    res.redirect(`/companies/${companyId}`);
                } else {
                    req.flash('error', 'Failed to update company. No changes were made.');
                    res.redirect(`/company-edit/${companyId}`);
                }
    
            } catch (error) {
                console.error('Error updating company:', error);
    
                // Store form data to repopulate the form
                req.flash('old', req.body);
                req.flash('error', 'Failed to update company. Please check your information and try again.');
                res.redirect(`/company-edit/${req.params.id}`);
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

// Simple validation function
function validateSimpleUpdate(data) {
    const errors = [];

    // Required field validation
    if (!data.company_name?.trim()) {
        errors.push({ field: 'company_name', message: 'Company name is required' });
    }

    if (!data.company_tin?.trim()) {
        errors.push({ field: 'company_tin', message: 'TIN/Company code is required' });
    } else if (!/^\d{9}$/.test(data.company_tin.trim())) {
        errors.push({ field: 'company_tin', message: 'TIN must be exactly 9 digits' });
    }

    if (!data.business_activity?.trim()) {
        errors.push({ field: 'business_activity', message: 'Business activity is required' });
    }

    if (!data.company_phone?.trim()) {
        errors.push({ field: 'company_phone', message: 'Company phone is required' });
    } else if (!/^250\d{9}$/.test(data.company_phone.replace(/\D/g, ''))) {
        errors.push({ field: 'company_phone', message: 'Invalid phone number format. Use 250XXXXXXXXX' });
    }

    if (!data.firstname?.trim()) {
        errors.push({ field: 'firstname', message: 'First name is required' });
    }

    if (!data.lastname?.trim()) {
        errors.push({ field: 'lastname', message: 'Last name is required' });
    }

    if (!data.gender) {
        errors.push({ field: 'gender', message: 'Gender is required' });
    }

    if (!data.telephone?.trim()) {
        errors.push({ field: 'telephone', message: 'Phone number is required' });
    } else if (!/^250\d{9}$/.test(data.telephone.replace(/\D/g, ''))) {
        errors.push({ field: 'telephone', message: 'Invalid phone number format. Use 250XXXXXXXXX' });
    }

    if (!data.birthday) {
        errors.push({ field: 'birthday', message: 'Birth date is required' });
    } else {
        const birthDate = new Date(data.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 17 || age > 100) {
            errors.push({ field: 'birthday', message: 'Invalid birth date. Age must be between 17 and 100' });
        }
    }

    // Optional field validation
    if (data.company_email && data.company_email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.company_email.trim())) {
            errors.push({ field: 'company_email', message: 'Invalid email format' });
        }
    }

    if (data.rep_email && data.rep_email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.rep_email.trim())) {
            errors.push({ field: 'rep_email', message: 'Invalid email format' });
        }
    }

    if (data.company_website && data.company_website.trim()) {
        try {
            const url = data.company_website.trim();
            new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            errors.push({ field: 'company_website', message: 'Invalid website URL format' });
        }
    }

    return errors;
}

module.exports = companyController;