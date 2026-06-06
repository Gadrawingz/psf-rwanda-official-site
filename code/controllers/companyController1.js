// controllers/companyController.js
// Complete controller with all required methods

const CompanyModel = require('../models/companyModel');

// Import data sanitization helpers if you created them
// If you haven't created the dataSanitizer file yet, comment out this line
// const { sanitizeFormData, sanitizeLocationData, sanitizeIdentityData, sanitizeAssociationData, emptyStringToNull } = require('../utils/dataSanitizer');

// Helper function to convert empty strings to NULL (inline version if you don't have the utils file)
function emptyStringToNull(value) {
    if (value === '' || value === undefined || value === null) {
        return null;
    }
    return typeof value === 'string' ? value.trim() : value;
}

// Helper function to sanitize location data
function sanitizeLocationData(locationData) {
    const locationFields = ['province_id', 'district_id', 'sector_id', 'cell_id', 'village_id'];
    const sanitized = {};
    
    locationFields.forEach(field => {
        const value = locationData[field];
        if (value === '' || value === undefined || value === null || value === 'null') {
            sanitized[field] = null;
        } else {
            sanitized[field] = value;
        }
    });
    
    // Validate location hierarchy
    if (sanitized.village_id && !sanitized.cell_id) {
        throw new Error('Cell ID is required when Village ID is provided');
    }
    if (sanitized.cell_id && !sanitized.sector_id) {
        throw new Error('Sector ID is required when Cell ID is provided');
    }
    if (sanitized.sector_id && !sanitized.district_id) {
        throw new Error('District ID is required when Sector ID is provided');
    }
    
    return sanitized;
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
    
    // Show the membership form
    create: async (req, res) => {
        try {
            console.log('Rendering membership create form');
            
            // Get any old input data and errors from flash
            const oldInput = req.flash('oldInput')[0] || {};
            const errors = req.flash('errors') || [];
            const errorMessages = req.flash('error') || [];
            const successMessages = req.flash('success') || [];
            
            console.log('Flash data - Errors:', errors.length, 'ErrorMessages:', errorMessages.length);
            
            res.render('membership/create', {
                title: 'Company Membership Application',
                oldInput: oldInput,
                errors: errors,
                errorMessages: errorMessages,
                success: successMessages.length > 0 ? successMessages[0] : null
            });
        } catch (error) {
            console.error('Error showing membership form:', error);
            req.flash('error', 'Failed to load membership form');
            res.redirect('/');
        }
    },

    // Store the membership application
    store: async (req, res) => {
        try {
            console.log('Processing membership form submission');
            console.log('Raw form data keys:', Object.keys(req.body));
            
            // Validate required fields first
            const validationErrors = validateRequiredFields(req.body);
            if (validationErrors.length > 0) {
                console.log('Validation errors found:', validationErrors);
                req.flash('errors', validationErrors);
                req.flash('oldInput', req.body);
                return res.redirect('/membership/create');
            }
            

            // Sanitize location data
            let locationData;
            try {
                locationData = sanitizeLocationData({
                    province_id: req.body.provinceSelect,
                    district_id: req.body.districtSelect,
                    sector_id: req.body.sectorSelect,
                    cell_id: req.body.cellSelect,
                    village_id: req.body.villageSelect
                });
                console.log('Sanitized location data:', locationData);
            } catch (locationError) {
                console.error('Location validation error:', locationError.message);
                req.flash('error', locationError.message);
                req.flash('oldInput', req.body);
                return res.redirect('/membership/create');
            }

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

            // Prepare company data
            const companyData = {
                company_tin: emptyStringToNull(req.body.company_tin),
                registration_type: emptyStringToNull(req.body.registration_type),
                registration_number: emptyStringToNull(req.body.registration_number),
                company_name: emptyStringToNull(req.body.company_name),
                company_phone: emptyStringToNull(req.body.company_phone),
                company_email: emptyStringToNull(req.body.company_email),
                company_website: emptyStringToNull(req.body.company_website),
                business_activity: emptyStringToNull(req.body.business_activity),
                business_size: emptyStringToNull(req.body.business_size),
                company_type_id: emptyStringToNull(req.body.company_type_id),
                ownership_id: emptyStringToNull(req.body.ownership_id),
                permanent_employees: emptyStringToNull(req.body.permanent_employees),
                casual_employees: emptyStringToNull(req.body.casual_employees),
                has_association: hasAssociation,
                association_id: associationId,
                district_id: locationData.district_id,
                sector_id: locationData.sector_id,
                cell_id: locationData.cell_id,
                village_id: locationData.village_id,
                street_zone: emptyStringToNull(req.body.street_zone),
                financial_system: emptyStringToNull(req.body.financial_system),
                membership_category: emptyStringToNull(req.body.membership_category),
                membership_status: emptyStringToNull(req.body.membership_status),
                business_scope: emptyStringToNull(req.body.business_scope),
                int_countries: emptyStringToNull(req.body.int_countries),
                local_places: emptyStringToNull(req.body.local_places)
            };

            // Prepare representative data
            const representativeData = {
                firstname: emptyStringToNull(req.body.firstname),
                lastname: emptyStringToNull(req.body.lastname),
                gender: emptyStringToNull(req.body.gender),
                telephone: emptyStringToNull(req.body.telephone),
                email: emptyStringToNull(req.body.email),
                national_id: identityData.national_id,
                passport_number: identityData.passport_number,
                birthday: emptyStringToNull(req.body.birthday),
                has_insurance: emptyStringToNull(req.body.has_insurance),
                preferred_language: emptyStringToNull(req.body.preferred_language),
                areas_of_interest: emptyStringToNull(req.body.areas_of_interest),
                registered_by: req.user ? req.user.id : null
            };

            console.log('Final company data:', companyData);
            console.log('Final representative data:', representativeData);

            // Create the company and representative
            const result = await CompanyModel.create(companyData, representativeData);

            if (result.success) {
                console.log('Company created successfully with ID:', result.companyId);
                req.flash('success', 'Membership application submitted successfully!');
                res.redirect('/membership/success');
            } else {
                throw new Error(result.message || 'Failed to create company');
            }

        } catch (error) {
            console.error('Error creating company:', error);
            
            // Handle specific database errors
            let errorMessage = 'Failed to submit membership application. Please try again.';
            
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.sqlMessage.includes('unique_passport')) {
                    errorMessage = 'This passport number is already registered. Please check your passport number or contact support.';
                } else if (error.sqlMessage.includes('unique_national_id')) {
                    errorMessage = 'This national ID is already registered. Please check your national ID or contact support.';
                } else if (error.sqlMessage.includes('unique_company_tin')) {
                    errorMessage = 'This company TIN is already registered. Please check your TIN or contact support.';
                } else if (error.sqlMessage.includes('unique_company_email')) {
                    errorMessage = 'This company email is already registered. Please use a different email address.';
                } else {
                    errorMessage = 'Some of the information you provided is already registered. Please check your details.';
                }
            } else if (error.code === 'ER_BAD_NULL_ERROR') {
                if (error.sqlMessage.includes('district_id')) {
                    errorMessage = 'Please select a valid district from the location fields.';
                } else if (error.sqlMessage.includes('company_name')) {
                    errorMessage = 'Company name is required.';
                } else {
                    errorMessage = 'Some required fields are missing. Please check all required fields.';
                }
            } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                errorMessage = 'Invalid selection in one of the form fields. Please check your selections.';
            }

            req.flash('error', errorMessage);
            req.flash('oldInput', req.body);
            res.redirect('/membership/create');
        }
    },

    // Success page
    success: (req, res) => {
        try {
            console.log('Rendering success page');
            const successMessage = req.flash('success')[0] || 'Application submitted successfully!';
            res.render('membership/success', {
                title: 'Application Successful',
                message: successMessage
            });
        } catch (error) {
            console.error('Error rendering success page:', error);
            res.redirect('/membership/create');
        }
    },

    // List all companies (optional)
    index: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await CompanyModel.getAll(page, limit);
            
            res.render('membership/index', {
                title: 'Company Memberships',
                companies: result.companies,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error fetching companies:', error);
            req.flash('error', 'Failed to load companies');
            res.redirect('/');
        }
    },

    // Show single company (optional)
    show: async (req, res) => {
        try {
            const companyId = req.params.id;
            const company = await CompanyModel.findById(companyId);
            
            if (!company) {
                req.flash('error', 'Company not found');
                return res.redirect('/membership');
            }
            
            res.render('membership/show', {
                title: 'Company Details',
                company: company
            });
        } catch (error) {
            console.error('Error fetching company:', error);
            req.flash('error', 'Failed to load company details');
            res.redirect('/membership');
        }
    },
    
};

// Helper function to validate required fields
function validateRequiredFields(data) {
    const errors = [];
    const requiredFields = {
        company_tin: 'Company TIN',
        registration_type: 'Registration Type',
        registration_number: 'Registration Number',
        company_name: 'Company Name',
        company_phone: 'Company Phone',
        company_email: 'Company Email',
        business_activity: 'Business Activity',
        business_size: 'Business Size',
        company_type_id: 'Company Type',
        ownership_id: 'Ownership Type',
        permanent_employees: 'Permanent Employees',
        casual_employees: 'Casual Employees',
        membership_category: 'Membership Category',
        membership_status: 'Membership Status',
        business_scope: 'Business Scope',
        firstname: 'First Name',
        lastname: 'Last Name',
        gender: 'Gender',
        telephone: 'Telephone',
        email: 'Email',
        nationality: 'Nationality',
        birthday: 'Birthday',
        preferred_language: 'Preferred Language'
    };

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${requiredFields[field]} is required.`);
        }
    });

    // Validate nationality-specific ID requirements
    if (data.nationality === 'Rwandan' && (!data.national_id || data.national_id.trim() === '')) {
        errors.push('National ID is required for Rwandan nationals.');
    }

    if (data.nationality === 'Non-Rwandan' && (!data.passport_number || data.passport_number.trim() === '')) {
        errors.push('Passport number is required for non-Rwandan nationals.');
    }

    // Validate location fields
    if (!data.districtSelect || data.districtSelect === '') {
        errors.push('District selection is required.');
    }

    // Validate business scope specific fields
    if (data.business_scope === 'international' && (!data.int_countries || data.int_countries.trim() === '')) {
        errors.push('International countries are required for international business scope.');
    }

    return errors;
}

// Make sure to export the controller
module.exports = companyController;