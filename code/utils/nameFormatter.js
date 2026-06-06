// utils/nameFormatter.js
// Utility functions for capitalizing names and company names

/**
 * Capitalize the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') return str;
    
    return str
        .toLowerCase()
        .split(' ')
        .map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Capitalize names (handles special cases like McDonald, O'Connor, etc.)
 * @param {string} name - The name to capitalize
 * @returns {string} - Properly capitalized name
 */
function capitalizeName(name) {
    if (!name || typeof name !== 'string') return name;
    
    // Remove extra spaces and convert to lowercase
    const cleanName = name.trim().replace(/\s+/g, ' ').toLowerCase();
    
    return cleanName
        .split(' ')
        .map(word => {
            if (word.length === 0) return word;
            
            // Handle special prefixes like Mc, Mac, O', De, Van, etc.
            if (word.startsWith('mc') && word.length > 2) {
                return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3);
            }
            if (word.startsWith('mac') && word.length > 3) {
                return 'Mac' + word.charAt(3).toUpperCase() + word.slice(4);
            }
            if (word.startsWith("o'") && word.length > 2) {
                return "O'" + word.charAt(2).toUpperCase() + word.slice(3);
            }
            if (word === 'de' || word === 'da' || word === 'du' || word === 'van' || word === 'von') {
                return word; // Keep these lowercase
            }
            
            // Standard capitalization
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Capitalize company names (handles Ltd, LLC, Corp, etc.)
 * @param {string} companyName - The company name to capitalize
 * @returns {string} - Properly capitalized company name
 */
function capitalizeCompanyName(companyName) {
    if (!companyName || typeof companyName !== 'string') return companyName;
    
    // Remove extra spaces
    const cleanName = companyName.trim().replace(/\s+/g, ' ');
    
    // Common company suffixes that should be uppercase
    const upperCaseSuffixes = ['LTD', 'LLC', 'INC', 'CORP', 'CO', 'SA', 'SARL', 'PLC', 'AG'];
    
    // Split into words and capitalize each
    const words = cleanName.toLowerCase().split(' ');
    
    return words.map((word, index) => {
        if (word.length === 0) return word;
        
        // Check if it's a company suffix
        if (upperCaseSuffixes.includes(word.toUpperCase())) {
            return word.toUpperCase();
        }
        
        // Handle common business terms
        if (word === 'and' && index > 0 && index < words.length - 1) {
            return 'and'; // Keep 'and' lowercase when it's in the middle
        }
        
        if (word === 'the' && index === 0) {
            return 'The'; // Capitalize 'the' at the beginning
        }
        
        if (word === 'of' || word === 'for' || word === 'in' || word === 'on') {
            return word; // Keep prepositions lowercase
        }
        
        // Standard capitalization
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Format all names in an object
 * @param {Object} data - Object containing name fields
 * @returns {Object} - Object with capitalized names
 */
function formatNames(data) {
    const formatted = { ...data };
    
    // Format person names
    if (formatted.firstname) {
        formatted.firstname = capitalizeName(formatted.firstname);
    }
    if (formatted.lastname) {
        formatted.lastname = capitalizeName(formatted.lastname);
    }
    
    // Format company name
    if (formatted.company_name) {
        formatted.company_name = capitalizeCompanyName(formatted.company_name);
    }
    
    return formatted;
}

module.exports = {
    capitalizeFirstLetter,
    capitalizeName,
    capitalizeCompanyName,
    formatNames
};