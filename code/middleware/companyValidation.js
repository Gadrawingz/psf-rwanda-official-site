const { body, validationResult } = require('express-validator');
const CompanyService = require('../services/companyService');

class CompanyValidation {
  
  // Rwandan phone number validation
  static validateRwandanPhone() {
    return body('company_phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(\+250|250)?[0-9]{9}$/)
      .withMessage('Invalid Rwandan phone number format. Use: +250XXXXXXXXX or 250XXXXXXXXX or XXXXXXXXX')
      .isLength({ min: 9, max: 13 })
      .withMessage('Phone number must be between 9-13 characters')
      .custom(async (value, { req }) => {
        // Normalize phone number for consistency
        let normalizedPhone = value.replace(/^\+250/, '').replace(/^250/, '');
        if (normalizedPhone.length === 9) {
          normalizedPhone = '250' + normalizedPhone;
        }
        
        const exists = await CompanyService.checkPhoneExists(normalizedPhone, req.params.id);
        if (exists) {
          throw new Error('Phone number already exists in the system');
        }
        
        // Store normalized phone for use in controller
        req.normalizedPhone = normalizedPhone;
        return true;
      });
  }

  // Representative phone validation
  static validateRepPhone() {
    return body('telephone')
      .notEmpty()
      .withMessage('Representative phone number is required')
      .matches(/^(\+250|250)?[0-9]{9}$/)
      .withMessage('Invalid Rwandan phone number format for representative')
      .custom(async (value, { req }) => {
        let normalizedPhone = value.replace(/^\+250/, '').replace(/^250/, '');
        if (normalizedPhone.length === 9) {
          normalizedPhone = '250' + normalizedPhone;
        }
        
        const exists = await CompanyService.checkRepPhoneExists(normalizedPhone, req.params.id);
        if (exists) {
          throw new Error('Representative phone number already exists in the system');
        }
        
        req.normalizedRepPhone = normalizedPhone;
        return true;
      });
  }

  // Email validation
  static validateEmail() {
    return body('company_email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const exists = await CompanyService.checkEmailExists(value, req.params.id);
        if (exists) {
          throw new Error('Email address already exists in the system');
        }
        return true;
      });
  }

  // Representative email validation
  static validateRepEmail() {
    return body('rep_email')
      .isEmail()
      .withMessage('Please provide a valid representative email address')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const exists = await CompanyService.checkRepEmailExists(value, req.params.id);
        if (exists) {
          throw new Error('Representative email address already exists in the system');
        }
        return true;
      });
  }

  // Rwandan National ID validation
  
  // National ID validation - only validates if the field has a value
  static validateNationalId() {
    return body('national_id')
      .if(body('national_id').notEmpty()) // Only validate if national_id is not empty
      .notEmpty()
      .withMessage('National ID is required')
      .isNumeric()
      .withMessage('National ID must contain only numbers')
      .isLength({ min: 16, max: 16 })
      .withMessage('Rwandan National ID must be exactly 16 digits')
      .custom(async (value, { req }) => {
        // Only check for duplicates if value exists
        if (value && value.trim() !== '') {
          const exists = await CompanyService.checkNationalIdExists(value, req.params.id);
          if (exists) {
            throw new Error('National ID already exists in the system');
          }
        }
        return true;
      });
  }

  // Passport validation - only validates if the field has a value
  static validatePassport() {
    return body('passport_number')
      .if(body('passport_number').notEmpty()) // Only validate if passport_number is not empty
      .notEmpty()
      .withMessage('Passport number is required')
      .isLength({ min: 6, max: 12 })
      .withMessage('Passport number must be between 6-12 characters')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Passport number should contain only uppercase letters and numbers')
      .custom(async (value, { req }) => {
        // Only check for duplicates if value exists
        if (value && value.trim() !== '') {
          const exists = await CompanyService.checkPassportExists(value, req.params.id);
          if (exists) {
            throw new Error('Passport number already exists in the system');
          }
        }
        return true;
      });
  }


  // TIN validation for Rwanda (RRA/RDB standards)
  static validateTIN() {
    return body('company_tin')
      .notEmpty()
      .withMessage('TIN (Tax Identification Number) is required')
      .matches(/^[0-9]{9}$/)
      .withMessage('TIN must be exactly 9 digits for Rwandan companies')
      .custom(async (value, { req }) => {
        // Validate TIN checksum (Rwanda specific)
        if (!CompanyValidation.validateTINChecksum(value)) {
          throw new Error('Invalid TIN checksum. Please verify your TIN number');
        }
        
        const exists = await CompanyService.checkTINExists(value, req.params.id);
        if (exists) {
          throw new Error('TIN already exists in the system');
        }
        return true;
      });
  }

  // Rwanda TIN checksum validation (simplified - you may need to adjust based on actual RRA algorithm)
  static validateTINChecksum(tin) {
    if (tin.length !== 9) return false;
    
    // Basic validation - all zeros or repeated digits are invalid
    if (/^0{9}$/.test(tin) || /^(\d)\1{8}$/.test(tin)) {
      return false;
    }
    
    // You can implement the actual RRA checksum algorithm here
    // This is a placeholder that does basic validation
    return true;
  }

  // Company name validation
  static validateCompanyName() {
    return body('company_name')
      .notEmpty()
      .withMessage('Company name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2-100 characters')
      .matches(/^[a-zA-Z0-9\s\-&.,()]+$/)
      .withMessage('Company name contains invalid characters');
  }

  // Website validation
  static validateWebsite() {
    return body('company_website')
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage('Please provide a valid website URL');
  }

  // Combined validation chain for company creation
  static getValidationRules() {
    return [
      this.validateCompanyName(),
      this.validateTIN(),
      this.validateRwandanPhone(),
      this.validateEmail(),
      this.validateWebsite(),
      this.validateRepPhone(),
      this.validateRepEmail(),
      this.validateNationalId(),
      this.validatePassport(),
      // Add other field validations as needed
      body('firstname')
        .notEmpty()
        .withMessage('Representative first name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2-50 characters'),
      body('lastname')
        .notEmpty()
        .withMessage('Representative last name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2-50 characters'),
      body('gender')
        .isIn(['M', 'F', 'Other'])
        .withMessage('Please select a valid gender'),
      body('birthday')
        .isDate()
        .withMessage('Please provide a valid birth date')
        .custom((value) => {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18 || age > 100) {
            throw new Error('Representative must be between 17-120 years old');
          }
          return true;
        })
    ];
  }

  // Validation result handler
  static handleValidationErrors() {
    return (req, res, next) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        // Store the submitted form data to repopulate form
        req.flash('old', req.body);
        
        // Group errors by field for better organization
        const errorsByField = {};
        errors.array().forEach(error => {
          if (!errorsByField[error.path]) {
            errorsByField[error.path] = [];
          }
          errorsByField[error.path].push(error.msg);
        });

        // Set flash messages for each field error
        Object.keys(errorsByField).forEach(field => {
          req.flash(`error_${field}`, errorsByField[field]);
        });

        // Set a general error message
        const errorCount = errors.array().length;
        req.flash('error', `Please fix ${errorCount} validation error(s) below.`);

        // Redirect back to the form
        return res.redirect('/companies/create');
      }
      
      next();
    };
  }

  // Alternative method for API endpoints (Just for JSON responses)
  static handleValidationErrorsAPI() {
    return (req, res, next) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        // Group errors by field for better organization
        const errorsByField = {};
        errors.array().forEach(error => {
          if (!errorsByField[error.path]) {
            errorsByField[error.path] = [];
          }
          errorsByField[error.path].push(error.msg);
        });

        // Return error response for API
        return res.status(422).json({
          status: 'error',
          message: 'Validation failed',
          errors: errorsByField
        });
      }
      
      next();
    };
  }
}

module.exports = CompanyValidation;