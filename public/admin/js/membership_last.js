/**
 * Membership Form JavaScript
 * Handles form interactions, dynamic field updates, and API calls
 * @gadrawingz - Fixed version
 */

// ====================================================
// 1. LOCATION HIERARCHY (Province > District > Sector > Cell > Village)
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    // Get all location select elements
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const sectorSelect = document.getElementById('sectorSelect');
    const cellSelect = document.getElementById('cellSelect');
    const villageSelect = document.getElementById('villageSelect');

    // Get all loading indicators
    const provinceLoading = document.getElementById('provinceLoading');
    const districtLoading = document.getElementById('districtLoading');
    const sectorLoading = document.getElementById('sectorLoading');
    const cellLoading = document.getElementById('cellLoading');
    const villageLoading = document.getElementById('villageLoading');

    // Helper function to fetch data from API
    async function fetchData(url) {
        try {
            console.log(`Fetching data from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Data received:`, data);
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            // Show user-friendly error message
            alert(`Failed to load data. Please check your internet connection and try again.`);
            return [];
        }
    }

    // Helper function to populate select elements
    function populateSelect(selectElement, data, defaultOption = '-- Select --') {
        if (!selectElement) {
            console.error('Select element not found');
            return;
        }

        // Clear existing options except the first one
        selectElement.innerHTML = `<option value="">${defaultOption}</option>`;

        // Check if data is an array and has items
        if (!Array.isArray(data) || data.length === 0) {
            console.warn('No data to populate select element');
            selectElement.disabled = true;
            return;
        }

        // Add new options based on select element type
        data.forEach(item => {
            const option = document.createElement('option');
            let id, name;

            // Determine ID and name fields based on select element
            if (selectElement === districtSelect) {
                id = item.district_id;
                name = item.district_name;
            } else if (selectElement === sectorSelect) {
                id = item.sector_id;
                name = item.sector_name;
            } else if (selectElement === cellSelect) {
                id = item.cell_id;
                name = item.cell_name;
            } else if (selectElement === villageSelect) {
                id = item.village_id;
                name = item.village_name;
            }

            if (id && name) {
                option.value = id;
                option.textContent = name;
                selectElement.appendChild(option);
            }
        });

        // Enable the select element
        selectElement.disabled = false;
        console.log(`Populated ${selectElement.id} with ${data.length} options`);
    }

    // Helper function to reset dependent dropdowns
    function resetDependentDropdowns(startIndex) {
        const dropdowns = [districtSelect, sectorSelect, cellSelect, villageSelect];
        const defaultTexts = ['-- Select District --', '-- Select Sector --', '-- Select Cell --', '-- Select Village --'];

        for (let i = startIndex; i < dropdowns.length; i++) {
            if (dropdowns[i]) {
                dropdowns[i].innerHTML = `<option value="">${defaultTexts[i]}</option>`;
                dropdowns[i].disabled = true;
            }
        }
    }

    // Province selection event listener
    if (provinceSelect) {
        provinceSelect.addEventListener('change', async function () {
            const provinceId = this.value;
            console.log(`Province selected: ${provinceId}`);
            
            resetDependentDropdowns(0);

            if (!provinceId) return;

            if (districtLoading) districtLoading.style.display = 'inline-block';
            
            const districts = await fetchData(`/api/districts/${provinceId}`);
            
            if (districtLoading) districtLoading.style.display = 'none';
            
            populateSelect(districtSelect, districts, '-- Select District --');
        });
    }

    // District selection event listener
    if (districtSelect) {
        districtSelect.addEventListener('change', async function () {
            const districtId = this.value;
            console.log(`District selected: ${districtId}`);
            
            resetDependentDropdowns(1);

            if (!districtId) return;

            if (sectorLoading) sectorLoading.style.display = 'inline-block';
            
            const sectors = await fetchData(`/api/sectors/${districtId}`);
            
            if (sectorLoading) sectorLoading.style.display = 'none';
            
            populateSelect(sectorSelect, sectors, '-- Select Sector --');
        });
    }

    // Sector selection event listener
    if (sectorSelect) {
        sectorSelect.addEventListener('change', async function () {
            const sectorId = this.value;
            console.log(`Sector selected: ${sectorId}`);
            
            resetDependentDropdowns(2);

            if (!sectorId) return;

            if (cellLoading) cellLoading.style.display = 'inline-block';
            
            const cells = await fetchData(`/api/cells/${sectorId}`);
            
            if (cellLoading) cellLoading.style.display = 'none';
            
            populateSelect(cellSelect, cells, '-- Select Cell --');
        });
    }

    // Cell selection event listener
    if (cellSelect) {
        cellSelect.addEventListener('change', async function () {
            const cellId = this.value;
            console.log(`Cell selected: ${cellId}`);
            
            resetDependentDropdowns(3);

            if (!cellId) return;

            if (villageLoading) villageLoading.style.display = 'inline-block';
            
            const villages = await fetchData(`/api/villages/${cellId}`);
            
            if (villageLoading) villageLoading.style.display = 'none';
            
            populateSelect(villageSelect, villages, '-- Select Village --');
        });
    }

    // Initialize form with old data if available (for validation errors)
    function initializeLocationData() {
        // Check if we have old form data (from validation errors)
        const oldProvinceId = provinceSelect ? provinceSelect.value : null;
        const oldDistrictId = districtSelect ? districtSelect.getAttribute('data-selected') : null;
        const oldSectorId = sectorSelect ? sectorSelect.getAttribute('data-selected') : null;
        const oldCellId = cellSelect ? cellSelect.getAttribute('data-selected') : null;
        const oldVillageId = villageSelect ? villageSelect.getAttribute('data-selected') : null;

        // If we have old data, reload the dependent dropdowns
        if (oldProvinceId && oldDistrictId) {
            loadDistrictsAndSelect(oldProvinceId, oldDistrictId);
        }
    }

    // Helper function to load districts and select a specific one
    async function loadDistrictsAndSelect(provinceId, districtId) {
        if (districtLoading) districtLoading.style.display = 'inline-block';
        
        const districts = await fetchData(`/api/districts/${provinceId}`);
        
        if (districtLoading) districtLoading.style.display = 'none';
        
        populateSelect(districtSelect, districts, '-- Select District --');
        
        if (districtId && districtSelect) {
            districtSelect.value = districtId;
            // Trigger change event to load sectors
            districtSelect.dispatchEvent(new Event('change'));
        }
    }

    // Initialize on page load
    initializeLocationData();
});

// ====================================================
// 2. BUSINESS SCOPE & LOCATION FIELDS
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const businessScopeSelect = document.getElementById('business_scope');
    const internationalCountriesField = document.getElementById('int_countries_field');
    const localPlacesField = document.getElementById('local_places_field');
    const internationalCountriesInput = document.getElementById('int_countries');
    const localPlacesInput = document.getElementById('local_places');
    const form = document.getElementById('companyMembershipForm');

    // Toggle location fields based on business scope
    function toggleLocationFields() {
        if (!businessScopeSelect) return;

        // Hide both fields and remove required attributes
        if (internationalCountriesField) {
            internationalCountriesField.classList.add('hidden-field');
            if (internationalCountriesInput) {
                internationalCountriesInput.removeAttribute('required');
                internationalCountriesInput.value = '';
            }
        }

        if (localPlacesField) {
            localPlacesField.classList.add('hidden-field');
            if (localPlacesInput) {
                localPlacesInput.removeAttribute('required');
                localPlacesInput.value = '';
            }
        }

        // Show and make required based on selected business scope
        if (businessScopeSelect.value === 'international' && internationalCountriesField) {
            internationalCountriesField.classList.remove('hidden-field');
            if (internationalCountriesInput) {
                internationalCountriesInput.setAttribute('required', 'required');
            }
        } else if (businessScopeSelect.value === 'local' && localPlacesField) {
            localPlacesField.classList.remove('hidden-field');
            // Note: local_places is optional, so we don't make it required
        }
    }

    // Business scope change event listener
    if (businessScopeSelect) {
        businessScopeSelect.addEventListener('change', toggleLocationFields);
    }

    // Form validation for business scope
    if (form) {
        form.addEventListener('submit', function (event) {
            let isValid = true;

            // Clear existing error messages
            document.querySelectorAll('.error-message').forEach(span => span.textContent = '');

            // Validate business scope selection
            if (businessScopeSelect && businessScopeSelect.value === '') {
                const errorElement = document.getElementById('business_scope_error');
                if (errorElement) {
                    errorElement.textContent = 'Please select a business scope.';
                    isValid = false;
                }
            }

            // Validate visible location fields
            if (businessScopeSelect && businessScopeSelect.value === 'international' && 
                internationalCountriesInput && internationalCountriesInput.value.trim() === '') {
                const errorElement = document.getElementById('int_countries_error');
                if (errorElement) {
                    errorElement.textContent = 'International countries are required for international scope.';
                    isValid = false;
                }
            }

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    // Initialize fields on page load
    toggleLocationFields();
});

// ====================================================
// 3. NATIONALITY & ID FIELDS (National ID vs Passport)
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const nationalitySelect = document.getElementById('nationality');
    const nationalIdGroup = document.getElementById('nationalIdGroup');
    const passportGroup = document.getElementById('passportGroup');
    const nationalIdInput = document.getElementById('national_id');
    const passportInput = document.getElementById('passport_number');
    const form = document.getElementById('companyMembershipForm');

    // Update ID fields based on nationality selection
    function updateIdFields() {
        if (!nationalitySelect) return;

        const selectedNationality = nationalitySelect.value;
        console.log(`Nationality selected: ${selectedNationality}`);

        // Clear current values and error messages
        if (nationalIdInput) nationalIdInput.value = '';
        if (passportInput) passportInput.value = '';

        const nationalIdError = document.getElementById('nationalIdError');
        const passportError = document.getElementById('passportError');
        if (nationalIdError) nationalIdError.textContent = '';
        if (passportError) passportError.textContent = '';

        // Hide all ID fields initially
        if (nationalIdGroup) {
            nationalIdGroup.classList.add('nid-hidden');
            if (nationalIdInput) nationalIdInput.removeAttribute('required');
        }
        if (passportGroup) {
            passportGroup.classList.add('nid-hidden');
            if (passportInput) passportInput.removeAttribute('required');
        }

        // Show appropriate field based on nationality
        if (selectedNationality === 'Rwandan' && nationalIdGroup && nationalIdInput) {
            nationalIdGroup.classList.remove('nid-hidden');
            nationalIdInput.setAttribute('required', 'required');
        } else if (selectedNationality === 'Non-Rwandan' && passportGroup && passportInput) {
            passportGroup.classList.remove('nid-hidden');
            passportInput.setAttribute('required', 'required');
        }
    }

    // Nationality change event listener
    if (nationalitySelect) {
        nationalitySelect.addEventListener('change', updateIdFields);
    }

    // ID validation on form submission
    if (form) {
        form.addEventListener('submit', function (event) {
            if (!nationalitySelect) return;

            let isValid = true;
            const nationalIdError = document.getElementById('nationalIdError');
            const passportError = document.getElementById('passportError');

            if (nationalIdError) nationalIdError.textContent = '';
            if (passportError) passportError.textContent = '';

            // Validate National ID for Rwandans
            if (nationalitySelect.value === 'Rwandan' && nationalIdInput) {
                if (!nationalIdInput.value.match(/^[0-9]{16}$/)) {
                    if (nationalIdError) {
                        nationalIdError.textContent = 'National ID must be exactly 16 digits (numbers only).';
                        isValid = false;
                    }
                }
            }
            // Validate Passport for Non-Rwandans
            else if (nationalitySelect.value === 'Non-Rwandan' && passportInput) {
                if (!passportInput.value.match(/^[A-Z0-9]{6,12}$/)) {
                    if (passportError) {
                        passportError.textContent = 'Passport must be 6-12 characters (uppercase letters and numbers).';
                        isValid = false;
                    }
                }
            }

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    // Initialize ID fields on page load
    updateIdFields();
});


// ====================================================
// 4. ASSOCIATION MEMBERSHIP & PSF CONTRIBUTOR
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const hasAssociationRadios = document.querySelectorAll('input[name="has_association"]');
    const associationContainer = document.getElementById('association_select_container');
    const psfContributorContainer = document.getElementById('psf_contributor_container');
    const associationSelect = document.getElementById('association_id');
    const associationLoader = document.getElementById('association_loader');

    // Handle association membership radio button changes
    hasAssociationRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            console.log(`Association membership changed to: ${this.value}`);
            
            if (this.value === '1') {
                // Show both association select and PSF contributor containers
                if (associationContainer) {
                    associationContainer.style.display = 'block';
                    loadAssociations();
                }
                if (psfContributorContainer) {
                    psfContributorContainer.style.display = 'block';
                }
            } else {
                // Hide both containers and reset values
                if (associationContainer) {
                    associationContainer.style.display = 'none';
                }
                if (psfContributorContainer) {
                    psfContributorContainer.style.display = 'none';
                }
                
                // Reset association selection
                if (associationSelect) {
                    associationSelect.value = '';
                }
                
                // Reset PSF contributor to "No" (default)
                const contributorNoRadio = document.getElementById('contributor_no');
                if (contributorNoRadio) {
                    contributorNoRadio.checked = true;
                }
            }
        });
    });

    // Load associations from API
    async function loadAssociations() {
        if (!associationSelect || !associationLoader) {
            console.error('Association select elements not found');
            return;
        }

        try {
            console.log('Loading associations...');
            associationLoader.style.display = 'inline-block';

            const response = await fetch('/api/associations');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Associations response:', result);

            if (result.success) {
                // Clear existing options except the first one
                associationSelect.innerHTML = '<option value="">-- Select association --</option>';

                // Add associations to select dropdown
                result.data.forEach(association => {
                    const option = document.createElement('option');
                    option.value = association.assoc_id || association.id;

                    // Trim string function
                    function trimString(str, maxLength = 95) {
                        if (str && str.length > maxLength) {
                            return str.substring(0, maxLength - 3) + '...';
                        }
                        return str || '';
                    }

                    // Use assoc_name or name field
                    const associationName = association.assoc_name || association.name || 'Unknown Association';
                    const clusterName = association.cluster_name || association.cluster || '';
                    
                    option.textContent = trimString(clusterName ? `(${clusterName}) ${associationName}` : associationName);
                    associationSelect.appendChild(option);
                });

                console.log(`Loaded ${result.data.length} associations`);
            } else {
                console.error('Failed to load associations:', result.message || 'Unknown error');
                associationSelect.innerHTML = '<option value="">-- Error loading associations --</option>';
            }
        } catch (error) {
            console.error('Error loading associations:', error);
            associationSelect.innerHTML = '<option value="">-- Error loading associations --</option>';
            alert('Failed to load associations. Please check your internet connection and try again.');
        } finally {
            associationLoader.style.display = 'none';
        }
    }

    // Initialize on page load
    function initializeAssociationFields() {
        // Check if "Partner to associations" is selected
        const selectedAssociation = document.querySelector('input[name="has_association"]:checked');
        
        if (selectedAssociation && selectedAssociation.value === '1') {
            // Show both containers and load associations
            if (associationContainer) {
                associationContainer.style.display = 'block';
                loadAssociations();
            }
            if (psfContributorContainer) {
                psfContributorContainer.style.display = 'block';
            }
        } else {
            // Ensure both containers are hidden by default
            if (associationContainer) {
                associationContainer.style.display = 'none';
            }
            if (psfContributorContainer) {
                psfContributorContainer.style.display = 'none';
            }
            
            // Ensure "No" is selected by default for PSF contributor
            const contributorNoRadio = document.getElementById('contributor_no');
            if (contributorNoRadio && !document.querySelector('input[name="assoc_contributor"]:checked')) {
                contributorNoRadio.checked = true;
            }
        }
    }

    // Initialize fields on page load
    initializeAssociationFields();
});


// ====================================================
// 5. MEMBERSHIP STATUS & CATEGORY MANAGEMENT
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const membershipStatusRadios = document.querySelectorAll('input[name="membership_status"]');
    const membershipCategorySelect = document.getElementById('membership_category');

    if (membershipStatusRadios.length > 0 && membershipCategorySelect) {

        // Store all category options
        const categoryOptions = {
            newMember: [
                { value: "1", text: "No membership Yet" },
            ],

            existingMember: [
                { value: "2", text: "Golden Circle" },
                { value: "3", text: "Indashyikirwa" },
                { value: "4", text: "Ordinary Membership" },
                { value: "1", text: "No membership Yet" }
            ]
        };

        // Function to update membership category options based on status
        function updateMembershipCategory() {
            const selectedStatus = document.querySelector('input[name="membership_status"]:checked');

            if (!selectedStatus) return;

            const statusValue = selectedStatus.value;
            console.log(`Membership status changed to: ${statusValue}`);

            // Clear current options
            membershipCategorySelect.innerHTML = '<option value="">-- Select Category --</option>';

            let optionsToShow;

            if (statusValue === 'New') {
                // New member - show all options including "No membership Yet"
                optionsToShow = categoryOptions.newMember;
            } else if (statusValue === 'Exist') {
                // Existing member - show only options 2-6 (exclude "No membership Yet")
                optionsToShow = categoryOptions.existingMember;
            }

            // Add options to select dropdown
            if (optionsToShow) {
                optionsToShow.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    membershipCategorySelect.appendChild(optionElement);
                });

                // For new members, auto-select "No membership Yet"
                if (statusValue === 'New') {
                    membershipCategorySelect.value = '1';
                }
            }
        }

        // Add event listeners to membership status radio buttons
        membershipStatusRadios.forEach(radio => {
            radio.addEventListener('change', updateMembershipCategory);
        });

        // Initialize category options on page load
        updateMembershipCategory();
    }
});

// ====================================================
// 6. TIN AND REGISTRATION TYPE MANAGEMENT
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const companyTinInput = document.getElementById('company_tin');
    const registrationTypeSelect = document.getElementById('registration_type');
    const registrationNumberInput = document.getElementById('registration_number');
    const registrationNumberLabel = document.getElementById('registration_number_label');
    const registrationHelpText = document.getElementById('registration_help_text');

    if (companyTinInput && registrationTypeSelect && registrationNumberInput) {

        // Function to handle registration type changes
        function handleRegistrationTypeChange() {
            const selectedType = registrationTypeSelect.value;
            console.log(`Registration type changed to: ${selectedType}`);

            switch (selectedType) {
                case 'TIN':
                    // TIN selected - auto-fill with company TIN value
                    if (registrationNumberLabel) {
                        registrationNumberLabel.innerHTML = '<strong>TIN Number*</strong>';
                    }

                    // Sync TIN value to registration number
                    registrationNumberInput.value = companyTinInput.value || '';
                    registrationNumberInput.readOnly = true;
                    registrationNumberInput.classList.add('auto-filled');
                    registrationNumberInput.classList.remove('manual-input');
                    registrationNumberInput.type = 'number';

                    if (registrationHelpText) {
                        registrationHelpText.textContent = 'Auto-filled from TIN field above';
                    }

                    // Remove disabled state and make required
                    registrationNumberInput.removeAttribute('disabled');
                    registrationNumberInput.setAttribute('required', 'required');
                    break;

                case 'Patent':
                    // Patent selected - enable manual input
                    if (registrationNumberLabel) {
                        registrationNumberLabel.innerHTML = '<strong>Patent Number*</strong>';
                    }

                    registrationNumberInput.value = '';
                    registrationNumberInput.readOnly = false;
                    registrationNumberInput.classList.remove('auto-filled');
                    registrationNumberInput.classList.add('manual-input');
                    registrationNumberInput.type = 'text';
                    registrationNumberInput.placeholder = 'e.g., RW1234567';

                    if (registrationHelpText) {
                        registrationHelpText.textContent = 'Enter your patent number';
                    }

                    // Enable field and make required
                    registrationNumberInput.removeAttribute('disabled');
                    registrationNumberInput.setAttribute('required', 'required');
                    break;

                case 'RCA Number':
                    // RCA Number selected - enable manual input
                    if (registrationNumberLabel) {
                        registrationNumberLabel.innerHTML = '<strong>RCA Number*</strong>';
                    }

                    registrationNumberInput.value = '';
                    registrationNumberInput.readOnly = false;
                    registrationNumberInput.classList.remove('auto-filled');
                    registrationNumberInput.classList.add('manual-input');
                    registrationNumberInput.type = 'number';
                    registrationNumberInput.placeholder = 'e.g., 123456789';

                    if (registrationHelpText) {
                        registrationHelpText.textContent = 'Enter your RCA number';
                    }

                    // Enable field and make required
                    registrationNumberInput.removeAttribute('disabled');
                    registrationNumberInput.setAttribute('required', 'required');
                    break;
                
                case 'Other':
                    // Other selected - enable manual input
                    if (registrationNumberLabel) {
                        registrationNumberLabel.innerHTML = '<strong>Other Identification Number*</strong>';
                    }

                    registrationNumberInput.value = '';
                    registrationNumberInput.readOnly = false;
                    registrationNumberInput.classList.remove('auto-filled');
                    registrationNumberInput.classList.add('manual-input');
                    registrationNumberInput.type = 'text';
                    registrationNumberInput.placeholder = 'e.g., 123456789';

                    if (registrationHelpText) {
                        registrationHelpText.textContent = 'Enter your identification number';
                    }

                    // Enable field and make required
                    registrationNumberInput.removeAttribute('disabled');
                    registrationNumberInput.setAttribute('required', 'required');
                    break;

                default:
                    // No valid selection - disable field
                    registrationNumberInput.disabled = true;
                    registrationNumberInput.removeAttribute('required');
                    registrationNumberInput.value = '';

                    if (registrationHelpText) {
                        registrationHelpText.textContent = 'Please select a registration type first';
                    }
            }
        }

        // Function to sync TIN input with registration number when TIN is selected
        function syncTinWithRegistration() {
            if (registrationTypeSelect.value === 'TIN') {
                registrationNumberInput.value = companyTinInput.value || '';
            }
        }

        // Event listeners
        registrationTypeSelect.addEventListener('change', handleRegistrationTypeChange);

        // Sync TIN input with registration number field when TIN is selected
        companyTinInput.addEventListener('input', syncTinWithRegistration);
        companyTinInput.addEventListener('change', syncTinWithRegistration);

        // Initialize the form state on page load
        handleRegistrationTypeChange();
    }
});

// ====================================================
// 7. WEBSITE URL ENHANCEMENT (Optional)
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const websiteInput = document.getElementById('company_website');

    if (websiteInput) {
        // Auto-add https:// protocol when user leaves the field
        websiteInput.addEventListener('blur', function () {
            let value = this.value.trim();

            if (value && !value.match(/^https?:\/\//)) {
                // If user didn't include protocol and value contains a dot, add https://
                if (value.includes('.')) {
                    this.value = 'https://' + value;
                }
            }
        });
    }
});

// ====================================================
// 8. FORM SUBMISSION HANDLER
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('companyMembershipForm');

    if (form) {
        form.addEventListener('submit', function (e) {
            console.log('Form submission initiated');

            // Get all form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            console.log('Form data:', data);

            // Add any final validation here if needed
            
            // Allow normal form submission
        });
    }
});

// ====================================================
// 9. ERROR HANDLING AND DEBUGGING
// ====================================================

// Global error handler for debugging
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Console log helper for debugging
function debugLog(message, data = null) {
    if (console && console.log) {
        if (data) {
            console.log(`[DEBUG] ${message}:`, data);
        } else {
            console.log(`[DEBUG] ${message}`);
        }
    }
}


// Fixed Name capitalization
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

    // Add event listeners for name fields (ONLY blur event - removed input event)
    if (firstnameField) {
        firstnameField.addEventListener('blur', function() {
            this.value = capitalizeName(this.value);
        });
    }

    if (lastnameField) {
        lastnameField.addEventListener('blur', function() {
            this.value = capitalizeName(this.value);
        });
    }

    if (companyNameField) {
        companyNameField.addEventListener('blur', function() {
            this.value = capitalizeCompanyName(this.value);
        });
    }
}


// Phone number formatting for Rwanda
function setupSimplePhoneFormatting() {
    const phoneFields = document.querySelectorAll('input[type="tel"], input[name*="phone"], input[name*="telephone"]');
    
    phoneFields.forEach(field => {
        field.addEventListener('blur', function() {
            let phone = this.value.replace(/\D/g, ''); // Remove non-digits
            
            // Check for Rwanda mobile patterns and add 250
            if (phone.match(/^0(72|73|78|79)/)) {
                phone = '250' + phone.substring(1);
                this.value = phone;
                console.log('Rwanda phone formatted:', this.value);
            } else if (phone.match(/^(72|73|78|79)/) && !phone.startsWith('250')) {
                phone = '250' + phone;
                this.value = phone;
                console.log('Rwanda phone formatted:', this.value);
            }
        });
    });
}

setupSimplePhoneFormatting(); // Simple version (recommended)



document.addEventListener('DOMContentLoaded', function () {
    preserveIdFieldsOnError();
});

function preserveIdFieldsOnError() {
    const nationalitySelect = document.getElementById('nationality');
    const nationalIdGroup = document.getElementById('nationalIdGroup');
    const passportGroup = document.getElementById('passportGroup');
    const nationalIdInput = document.getElementById('national_id');
    const passportInput = document.getElementById('passport_number');

    // Function to show/hide fields based on nationality
    function toggleIdFields(nationality) {
        console.log('Toggling ID fields for nationality:', nationality);
        
        if (nationality === 'Rwandan') {
            if (nationalIdGroup) nationalIdGroup.style.display = 'block';
            if (passportGroup) passportGroup.style.display = 'none';
        } else if (nationality === 'Non-Rwandan') {
            if (nationalIdGroup) nationalIdGroup.style.display = 'none';
            if (passportGroup) passportGroup.style.display = 'block';
        } else {
            // No nationality selected - hide both
            if (nationalIdGroup) nationalIdGroup.style.display = 'none';
            if (passportGroup) passportGroup.style.display = 'none';
        }
    }

    // Initialize fields on page load (preserve old data)
    function initializeIdFields() {
        if (!nationalitySelect) return;

        const selectedNationality = nationalitySelect.value;
        const hasNationalId = nationalIdInput && nationalIdInput.value.trim() !== '';
        const hasPassport = passportInput && passportInput.value.trim() !== '';

        console.log('Initializing ID fields:', {
            nationality: selectedNationality,
            hasNationalId: hasNationalId,
            hasPassport: hasPassport
        });

        // If there's old data, show the appropriate field
        if (hasNationalId && selectedNationality === 'Rwandan') {
            toggleIdFields('Rwandan');
        } else if (hasPassport && selectedNationality === 'Non-Rwandan') {
            toggleIdFields('Non-Rwandan');
        } else if (selectedNationality) {
            // Nationality is selected but no conflicting old data
            toggleIdFields(selectedNationality);
        } else {
            // No nationality selected - check if there's old data to determine nationality
            if (hasNationalId && !hasPassport) {
                // Has national ID, probably Rwandan
                nationalitySelect.value = 'Rwandan';
                toggleIdFields('Rwandan');
            } else if (hasPassport && !hasNationalId) {
                // Has passport, probably Non-Rwandan
                nationalitySelect.value = 'Non-Rwandan';
                toggleIdFields('Non-Rwandan');
            } else {
                // Hide both fields
                toggleIdFields('');
            }
        }
    }

    // Add change event listener for nationality
    if (nationalitySelect) {
        nationalitySelect.addEventListener('change', function() {
            const selectedNationality = this.value;
            toggleIdFields(selectedNationality);
            
            // Clear the opposite field when nationality changes
            if (selectedNationality === 'Rwandan' && passportInput) {
                passportInput.value = '';
            } else if (selectedNationality === 'Non-Rwandan' && nationalIdInput) {
                nationalIdInput.value = '';
            }
        });
    }

    // Initialize on page load
    initializeIdFields();
}


// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    const companyTinInput = document.getElementById('company_tin');
    // Assuming error messages are displayed in a sibling container or within the parent
    const tinErrorContainer = companyTinInput.parentElement.querySelector('.error-messages-container') || companyTinInput.nextElementSibling; 

    let errorMessageSpan = tinErrorContainer.querySelector('.tin-error-message');
    if (!errorMessageSpan) {
        errorMessageSpan = document.createElement('span');
        errorMessageSpan.classList.add('error-message', 'tin-error-message');
        tinErrorContainer.appendChild(errorMessageSpan);
    }

    const showTinError = (message) => {
        errorMessageSpan.textContent = message;
        errorMessageSpan.style.display = message ? 'block' : 'none';
        companyTinInput.classList.toggle('field-error', !!message);
    };

    companyTinInput.addEventListener('input', function() {
        let tin = this.value;

        // Remove leading zeros
        if (tin.length > 1 && tin[0] === '0') {
            tin = parseInt(tin, 10).toString();
            this.value = tin;
        }

        // --- ENFORCE EXACT 9 DIGITS ON INPUT ---
        if (tin.length > 9) {
            this.value = tin.slice(0, 9); // Truncate if more than 9
            tin = this.value; // Update tin variable
        }
        
        showTinError(''); // Clear previous error

        // Provide immediate feedback if less than 9
        if (tin.length > 0 && tin.length < 9) {
            showTinError('TIN must be exactly 9 digits long.');
        }
    });

    companyTinInput.addEventListener('blur', function() {
        const tin = this.value;

        // --- FINAL VALIDATION ON BLUR ---
        if (tin.length === 0) {
            showTinError('TIN / Company Code is required.');
        } else if (tin.length !== 9) { // Check for exact 9 digits
            showTinError('TIN must be exactly 9 digits long.');
        } else {
            showTinError(''); // Clear error if valid
        }
    });
});
