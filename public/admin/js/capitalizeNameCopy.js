
// Name capitalization
document.addEventListener('DOMContentLoaded', function () {
    setupNameCapitalization();
});

function setupNameCapitalization() {
    // Get form fields that need capitalization
    const firstnameField = document.getElementById('firstname');
    const lastnameField = document.getElementById('lastname');
    const companyNameField = document.getElementById('company_name');

    // Utility function to capitalize names
    function capitalizeName(name) {
        if (!name || typeof name !== 'string') return name;
        
        const cleanName = name.trim().replace(/\s+/g, ' ').toLowerCase();
        
        return cleanName.split(' ').map(word => {
            if (word.length === 0) return word;
            
            // Handle special prefixes
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
                return word;
            }
            
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // Utility function to capitalize company names
    function capitalizeCompanyName(companyName) {
        if (!companyName || typeof companyName !== 'string') return companyName;
        
        const cleanName = companyName.trim().replace(/\s+/g, ' ');
        const upperCaseSuffixes = ['LTD', 'LLC', 'INC', 'CORP', 'CO', 'SA', 'SARL', 'PLC', 'AG'];
        const words = cleanName.toLowerCase().split(' ');
        
        return words.map((word, index) => {
            if (word.length === 0) return word;
            
            if (upperCaseSuffixes.includes(word.toUpperCase())) {
                return word.toUpperCase();
            }
            
            if (word === 'and' && index > 0 && index < words.length - 1) {
                return 'and';
            }
            
            if (word === 'the' && index === 0) {
                return 'The';
            }
            
            if (word === 'of' || word === 'for' || word === 'in' || word === 'on') {
                return word;
            }
            
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // Add event listeners for real-time capitalization
    if (firstnameField) {
        firstnameField.addEventListener('blur', function() {
            const cursorPosition = this.selectionStart;
            const originalLength = this.value.length;
            
            this.value = capitalizeName(this.value);
            
            // Restore cursor position (adjust for length changes)
            const newLength = this.value.length;
            const newPosition = cursorPosition + (newLength - originalLength);
            this.setSelectionRange(newPosition, newPosition);
        });
        
        // Optional: Real-time capitalization as user types
        firstnameField.addEventListener('input', function() {
            // Only capitalize if user pressed space (completed a word)
            if (this.value.endsWith(' ')) {
                const cursorPosition = this.selectionStart;
                this.value = capitalizeName(this.value);
                this.setSelectionRange(cursorPosition, cursorPosition);
            }
        });
    }

    if (lastnameField) {
        lastnameField.addEventListener('blur', function() {
            const cursorPosition = this.selectionStart;
            const originalLength = this.value.length;
            
            this.value = capitalizeName(this.value);
            
            const newLength = this.value.length;
            const newPosition = cursorPosition + (newLength - originalLength);
            this.setSelectionRange(newPosition, newPosition);
        });
        
        lastnameField.addEventListener('input', function() {
            if (this.value.endsWith(' ')) {
                const cursorPosition = this.selectionStart;
                this.value = capitalizeName(this.value);
                this.setSelectionRange(cursorPosition, cursorPosition);
            }
        });
    }

    if (companyNameField) {
        companyNameField.addEventListener('blur', function() {
            const cursorPosition = this.selectionStart;
            const originalLength = this.value.length;
            
            this.value = capitalizeCompanyName(this.value);
            
            const newLength = this.value.length;
            const newPosition = cursorPosition + (newLength - originalLength);
            this.setSelectionRange(newPosition, newPosition);
        });
        
        companyNameField.addEventListener('input', function() {
            if (this.value.endsWith(' ')) {
                const cursorPosition = this.selectionStart;
                this.value = capitalizeCompanyName(this.value);
                this.setSelectionRange(cursorPosition, cursorPosition);
            }
        });
    }
}

// Alternative approach: Capitalize on form submission
function capitalizeNamesOnSubmit() {
    const form = document.getElementById('companyMembershipForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Capitalize names before form submission
            const firstnameField = document.getElementById('firstname');
            const lastnameField = document.getElementById('lastname');
            const companyNameField = document.getElementById('company_name');
            
            if (firstnameField && firstnameField.value) {
                firstnameField.value = capitalizeName(firstnameField.value);
            }
            
            if (lastnameField && lastnameField.value) {
                lastnameField.value = capitalizeName(lastnameField.value);
            }
            
            if (companyNameField && companyNameField.value) {
                companyNameField.value = capitalizeCompanyName(companyNameField.value);
            }
        });
    }
}

// Call the function
capitalizeNamesOnSubmit();