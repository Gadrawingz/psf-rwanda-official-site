// utils/formHelpers.js - Helper functions for forms

const formHelpers = {
    // Get old input value
    old: function(fieldName, oldData = {}, defaultValue = '') {
        return oldData[fieldName] !== undefined ? oldData[fieldName] : defaultValue;
    },

    // Check if field has validation error
    hasError: function(fieldName, errors = {}) {
        return errors[fieldName] && errors[fieldName].length > 0;
    },

    // Get CSS class for field with error
    errorClass: function(fieldName, errors = {}, errorClass = 'field-error') {
        return this.hasError(fieldName, errors) ? errorClass : '';
    },

    // Check if option should be selected
    selected: function(fieldName, value, oldData = {}, companyData = {}) {
        const currentValue = oldData[fieldName] !== undefined ? oldData[fieldName] : companyData[fieldName];
        return currentValue == value ? 'selected' : '';
    },

    // Check if radio/checkbox should be checked
    checked: function(fieldName, value, oldData = {}, companyData = {}) {
        const currentValue = oldData[fieldName] !== undefined ? oldData[fieldName] : companyData[fieldName];
        return currentValue == value ? 'checked' : '';
    },

    // Format date for input fields
    formatDate: function(dateValue) {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        return date.toISOString().split('T')[0];
    },

    // Get display value with fallback
    displayValue: function(fieldName, oldData = {}, companyData = {}, defaultValue = '') {
        if (oldData[fieldName] !== undefined && oldData[fieldName] !== null) {
            return oldData[fieldName];
        }
        if (companyData[fieldName] !== undefined && companyData[fieldName] !== null) {
            return companyData[fieldName];
        }
        return defaultValue;
    },

    // Sanitize input to prevent XSS
    sanitize: function(input) {
        if (typeof input !== 'string') return input;
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    },

    // Format phone number for display
    formatPhone: function(phone) {
        if (!phone) return '';
        
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Format Rwanda numbers
        if (cleaned.startsWith('250') && cleaned.length === 12) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        }
        
        return phone; // Return original if not standard format
    },

    // Generate options for select elements
    generateOptions: function(options, selectedValue = '', placeholder = '-- Select --') {
        let html = `<option value="">${placeholder}</option>`;
        
        options.forEach(option => {
            const value = option.value || option.id;
            const text = option.text || option.name || option.label;
            const selected = value == selectedValue ? 'selected' : '';
            html += `<option value="${value}" ${selected}>${this.sanitize(text)}</option>`;
        });
        
        return html;
    },

    // Check if field is required based on conditions
    isRequired: function(fieldName, conditions = {}) {
        // Define conditional requirements
        const conditionalFields = {
            'national_id': () => conditions.nationality === 'Rwandan',
            'passport_number': () => conditions.nationality === 'Non-Rwandan',
            'int_countries': () => conditions.business_scope === 'international',
            'association_id': () => conditions.has_association === '1',
            'registration_number': () => conditions.registration_type !== 'TIN'
        };

        return conditionalFields[fieldName] ? conditionalFields[fieldName]() : false;
    },

    // Validate field based on type
    validateField: function(fieldName, value, type = 'text') {
        const validators = {
            email: (val) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(val);
            },
            
            phone: (val) => {
                const phoneRegex = /^250[0-9]{9}$/;
                return phoneRegex.test(val.replace(/\D/g, ''));
            },
            
            national_id: (val) => {
                return /^[0-9]{16}$/.test(val);
            },
            
            passport: (val) => {
                return /^[A-Z0-9]{6,12}$/.test(val);
            },
            
            tin: (val) => {
                return /^[0-9]{9}$/.test(val);
            },
            
            date: (val) => {
                const date = new Date(val);
                return !isNaN(date.getTime()) && date < new Date();
            },
            
            url: (val) => {
                try {
                    new URL(val.startsWith('http') ? val : `http://${val}`);
                    return true;
                } catch {
                    return false;
                }
            }
        };

        return validators[type] ? validators[type](value) : true;
    },

    // Get error message for field
    getErrorMessage: function(fieldName, errors = {}) {
        if (!this.hasError(fieldName, errors)) return '';
        
        return errors[fieldName].map(error => 
            `<span class="error-message">${this.sanitize(error)}</span>`
        ).join('');
    },

    // Generate form field with error handling
    generateField: function(options = {}) {
        const {
            type = 'text',
            name,
            label,
            value = '',
            required = false,
            placeholder = '',
            errors = {},
            oldData = {},
            companyData = {},
            attributes = {}
        } = options;

        const fieldValue = this.displayValue(name, oldData, companyData, value);
        const hasError = this.hasError(name, errors);
        const errorClass = hasError ? 'field-error' : '';
        const requiredAttr = required ? 'required' : '';
        const errorMessage = this.getErrorMessage(name, errors);

        // Build attributes string
        const attrString = Object.keys(attributes)
            .map(key => `${key}="${attributes[key]}"`)
            .join(' ');

        return `
            <div class="mb-3">
                <label for="${name}" class="form-label">
                    <strong>${label}${required ? '*' : ''}</strong>
                </label>
                <input type="${type}" 
                       class="form-control ${errorClass}" 
                       id="${name}" 
                       name="${name}" 
                       value="${this.sanitize(fieldValue)}" 
                       placeholder="${placeholder}"
                       ${requiredAttr}
                       ${attrString}>
                ${errorMessage}
            </div>
        `;
    },

    // Generate select field with options
    generateSelect: function(options = {}) {
        const {
            name,
            label,
            selectOptions = [],
            value = '',
            required = false,
            placeholder = '-- Select --',
            errors = {},
            oldData = {},
            companyData = {},
            attributes = {}
        } = options;

        const fieldValue = this.displayValue(name, oldData, companyData, value);
        const hasError = this.hasError(name, errors);
        const errorClass = hasError ? 'field-error' : '';
        const requiredAttr = required ? 'required' : '';
        const errorMessage = this.getErrorMessage(name, errors);

        // Build attributes string
        const attrString = Object.keys(attributes)
            .map(key => `${key}="${attributes[key]}"`)
            .join(' ');

        const optionsHtml = this.generateOptions(selectOptions, fieldValue, placeholder);

        return `
            <div class="mb-3">
                <label for="${name}" class="form-label">
                    <strong>${label}${required ? '*' : ''}</strong>
                </label>
                <select class="form-select ${errorClass}" 
                        id="${name}" 
                        name="${name}" 
                        ${requiredAttr}
                        ${attrString}>
                    ${optionsHtml}
                </select>
                ${errorMessage}
            </div>
        `;
    }
};

module.exports = formHelpers;