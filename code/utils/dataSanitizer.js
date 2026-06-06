// utils/dataSanitizer.js
// Helper functions to handle empty strings and data validation

/**
 * Convert empty strings to NULL for database insertion
 * @param {string} value - The value to check
 * @returns {string|null} - Returns NULL if empty string, otherwise returns the value
 */
function emptyStringToNull(value) {
    if (value === '' || value === undefined || value === null) {
        return null;
    }
    return typeof value === 'string' ? value.trim() : value;
}

/**
 * Sanitize form data by converting empty strings to NULL
 * @param {Object} data - The form data object
 * @param {Array} fields - Array of field names to sanitize
 * @returns {Object} - Sanitized data object
 */
function sanitizeFormData(data, fields = []) {
    const sanitized = { ...data };
    
    // If no specific fields provided, sanitize all string fields
    const fieldsToSanitize = fields.length > 0 ? fields : Object.keys(data);
    
    fieldsToSanitize.forEach(field => {
        if (sanitized.hasOwnProperty(field)) {
            sanitized[field] = emptyStringToNull(sanitized[field]);
        }
    });
    
    return sanitized;
}

/**
 * Sanitize location data - convert empty strings to NULL and validate hierarchy
 * @param {Object} locationData - Object containing location fields
 * @returns {Object} - Sanitized location data
 */
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

/**
 * Validate and sanitize passport/national ID data
 * @param {Object} identityData - Object containing nationality and ID fields
 * @returns {Object} - Sanitized identity data
 */
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

/**
 * Sanitize association data
 * @param {Object} associationData - Object containing association fields
 * @returns {Object} - Sanitized association data
 */
function sanitizeAssociationData(associationData) {
    const { has_association, association_id } = associationData;
    
    return {
        has_association,
        association_id: (has_association === '1' && association_id) ? association_id : null
    };
}

module.exports = {
    emptyStringToNull,
    sanitizeFormData,
    sanitizeLocationData,
    sanitizeIdentityData,
    sanitizeAssociationData
};