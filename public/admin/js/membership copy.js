/**
 * Membership Form JavaScript
 * Handles form interactions, dynamic field updates, and API calls
 * @gadrawingz
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
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }

    // Helper function to populate select elements
    function populateSelect(selectElement, data, defaultOption = '-- Select --') {
        // Clear existing options except the first one
        selectElement.innerHTML = `<option value="">${defaultOption}</option>`;

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

            option.value = id;
            option.textContent = name;
            selectElement.appendChild(option);
        });

        // Enable the select element
        selectElement.disabled = false;
    }

    // Helper function to reset dependent dropdowns
    function resetDependentDropdowns(startIndex) {
        const dropdowns = [districtSelect, sectorSelect, cellSelect, villageSelect];
        const defaultTexts = ['-- Select District --', '-- Select Sector --', '-- Select Cell --', '-- Select Village --'];

        for (let i = startIndex; i < dropdowns.length; i++) {
            dropdowns[i].innerHTML = `<option value="">${defaultTexts[i]}</option>`;
            dropdowns[i].disabled = true;
        }
    }

    // Province selection event listener
    if (provinceSelect) {
        provinceSelect.addEventListener('change', async function () {
            const provinceId = this.value;
            resetDependentDropdowns(0);

            if (!provinceId) return;

            districtLoading.style.display = 'inline-block';
            const districts = await fetchData(`/api/districts/${provinceId}`);
            districtLoading.style.display = 'none';
            populateSelect(districtSelect, districts, '-- Select District --');
        });
    }

    // District selection event listener
    if (districtSelect) {
        districtSelect.addEventListener('change', async function () {
            const districtId = this.value;
            resetDependentDropdowns(1);

            if (!districtId) return;

            sectorLoading.style.display = 'inline-block';
            const sectors = await fetchData(`/api/sectors/${districtId}`);
            sectorLoading.style.display = 'none';
            populateSelect(sectorSelect, sectors, '-- Select Sector --');
        });
    }

    // Sector selection event listener
    if (sectorSelect) {
        sectorSelect.addEventListener('change', async function () {
            const sectorId = this.value;
            resetDependentDropdowns(2);

            if (!sectorId) return;

            cellLoading.style.display = 'inline-block';
            const cells = await fetchData(`/api/cells/${sectorId}`);
            cellLoading.style.display = 'none';
            populateSelect(cellSelect, cells, '-- Select Cell --');
        });
    }

    // Cell selection event listener
    if (cellSelect) {
        cellSelect.addEventListener('change', async function () {
            const cellId = this.value;
            resetDependentDropdowns(3);

            if (!cellId) return;

            villageLoading.style.display = 'inline-block';
            const villages = await fetchData(`/api/villages/${cellId}`);
            villageLoading.style.display = 'none';
            populateSelect(villageSelect, villages, '-- Select Village --');
        });
    }
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
        // Hide both fields and remove required attributes
        if (internationalCountriesField) {
            internationalCountriesField.classList.add('hidden-field');
            internationalCountriesInput.removeAttribute('required');
            internationalCountriesInput.value = '';
        }

        if (localPlacesField) {
            localPlacesField.classList.add('hidden-field');
            localPlacesInput.removeAttribute('required');
            localPlacesInput.value = '';
        }

        // Show and make required based on selected business scope
        if (businessScopeSelect && businessScopeSelect.value === 'international') {
            internationalCountriesField.classList.remove('hidden-field');
            // internationalCountriesInput.setAttribute('required', 'required');
        } else if (businessScopeSelect && businessScopeSelect.value === 'local') {
            localPlacesField.classList.remove('hidden-field');
            // localPlacesInput.setAttribute('required', 'required');
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
            if (businessScopeSelect && businessScopeSelect.value === 'local' && localPlacesInput.value.trim() === '') {
                const errorElement = document.getElementById('local_places_error');
                if (errorElement) {
                    errorElement.textContent = 'Local places are required for local scope.';
                    isValid = false;
                }
            } else if (businessScopeSelect && businessScopeSelect.value === 'international' && internationalCountriesInput.value.trim() === '') {
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
            nationalIdInput.removeAttribute('required');
        }
        if (passportGroup) {
            passportGroup.classList.add('nid-hidden');
            passportInput.removeAttribute('required');
        }

        // Show appropriate field based on nationality
        if (selectedNationality === 'Rwandan' && nationalIdGroup) {
            nationalIdGroup.classList.remove('nid-hidden');
            nationalIdInput.setAttribute('required', 'required');
        } else if (selectedNationality === 'Non-Rwandan' && passportGroup) {
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
// 4. ASSOCIATION MEMBERSHIP & PSF AWARENESS
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const hasAssociationRadios = document.querySelectorAll('input[name="has_association"]');
    const associationContainer = document.getElementById('association_select_container');
    const associationSelect = document.getElementById('association');
    const associationLoader = document.getElementById('association_loader');

    const psfAwarenessRadios = document.querySelectorAll('input[name="aware_of_psf"]');
    const psfKnowledgeContainer = document.getElementById('psf_knowledge_container');
    const psfNoKnowledgeContainer = document.getElementById('psf_no_knowledge_container');

    // Handle association membership radio button changes
    hasAssociationRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === '1') {
                // Show association select dropdown and load data
                if (associationContainer) {
                    associationContainer.style.display = 'block';
                    loadAssociations();
                }
            } else {
                // Hide association select dropdown
                if (associationContainer) {
                    associationContainer.style.display = 'none';
                }
                if (associationSelect) {
                    associationSelect.value = '';
                }
            }
        });
    });

    // Handle PSF awareness radio button changes
    psfAwarenessRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            // Hide all PSF containers first
            if (psfKnowledgeContainer) psfKnowledgeContainer.style.display = 'none';
            if (psfNoKnowledgeContainer) psfNoKnowledgeContainer.style.display = 'none';

            // Clear textarea values
            const psfKnowledgeInput = document.getElementById('psf_knowledge');
            const psfNoKnowledgeInput = document.getElementById('psf_no_knowledge');
            if (psfKnowledgeInput) psfKnowledgeInput.value = '';
            if (psfNoKnowledgeInput) psfNoKnowledgeInput.value = '';

            // Show appropriate input based on PSF awareness
            if (this.value === '1' && psfKnowledgeContainer) {
                // Show "why you know PSF" input
                psfKnowledgeContainer.style.display = 'block';
            } else if (this.value === '0' && psfNoKnowledgeContainer) {
                // Show "why you don't know PSF" input
                psfNoKnowledgeContainer.style.display = 'block';
            }
        });
    });

    // Load associations from API
    async function loadAssociations() {
        if (!associationSelect || !associationLoader) return;

        try {
            associationLoader.style.display = 'inline-block';

            const response = await fetch('/api/associations');
            const result = await response.json();

            if (result.success) {
                // Clear existing options except the first one
                associationSelect.innerHTML = '<option value="" selected>-- Select association --</option>';

                // Add associations to select dropdown
                result.data.forEach(association => {
                    const option = document.createElement('option');
                    option.value = association.assoc_id;

                    // Trim string
                    function trimString(str, maxLength = 95) {
                        if (str.length > maxLength) {
                            return str.substring(0, maxLength - 3) + '...';
                        }
                        return str;
                    }

                    // Use assoc_name instead of association
                    option.textContent = trimString(`(${association.cluster_name}) ${association.assoc_name}`);
                    associationSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load associations:', result.message);
                associationSelect.innerHTML = '<option value="" selected>-- Error loading associations --</option>';
            }
        } catch (error) {
            console.error('Error loading associations:', error);
            associationSelect.innerHTML = '<option value="" selected>-- Error loading associations --</option>';
        } finally {
            associationLoader.style.display = 'none';
        }
    }
});

// ====================================================
// 5. FORM SUBMISSION HANDLER (if needed)
// ====================================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('companyMembershipForm');

    if (form) {
        form.addEventListener('submit', function (e) {
            // Add any additional form submission logic here
            console.log('Form submission initiated');

            // Example: Get all form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            console.log('Form data:', data);

            // Note: Remove e.preventDefault() to allow normal form submission
            // e.preventDefault(); // Uncomment this line to prevent actual submission for testing
        });
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
// 8. MEMBERSHIP STATUS & CATEGORY MANAGEMENT
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
                { value: "5", text: "Young Entrepreneurs" },
                { value: "6", text: "Women Entrepreneurs" },
                { value: "1", text: "No membership Yet" }
            ]
        };

        // Function to update membership category options based on status
        function updateMembershipCategory() {
            const selectedStatus = document.querySelector('input[name="membership_status"]:checked');

            if (!selectedStatus) return;

            const statusValue = selectedStatus.value;

            // Clear current options
            membershipCategorySelect.innerHTML = '<option value="" selected>-- Select Category --</option>';

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

        // Optional: Enforce "No membership Yet" for new members (readonly behavior)
        membershipCategorySelect.addEventListener('change', function () {
            const selectedStatus = document.querySelector('input[name="membership_status"]:checked');

            if (selectedStatus && selectedStatus.value === 'New') {
                // Uncomment the following lines if you want to enforce "No membership Yet" for new members
                if (this.value !== '1' && this.value !== '') {
                    alert('New members must select "No membership Yet"');
                    this.value = '1';
                }
            }
        });

        // Initialize category options on page load
        updateMembershipCategory();
    }
});

// ====================================================
// 9. TIN AND REGISTRATION TYPE MANAGEMENT
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
                    registrationNumberInput.focus();
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
                    registrationNumberInput.focus();
                    break;
                
                case 'Other':
                    // Patent selected - enable manual input
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
                        registrationHelpText.textContent = 'Enter your number';
                    }

                    // Enable field and make required
                    registrationNumberInput.removeAttribute('disabled');
                    registrationNumberInput.setAttribute('required', 'required');
                    registrationNumberInput.focus();
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

        // Enhanced form validation for TIN and registration fields
        const form = document.getElementById('companyMembershipForm') || document.getElementById('tinRegistrationForm');

        if (form) {
            form.addEventListener('submit', function (e) {
                let isValid = true;

                // Clear any previous error styling
                companyTinInput.classList.remove('is-invalid');
                registrationNumberInput.classList.remove('is-invalid');

                // Validate TIN field
                if (!companyTinInput.value.trim()) {
                    companyTinInput.classList.add('is-invalid');
                    isValid = false;

                    // Create or update error message
                    let errorElement = document.getElementById('company_tin_error');
                    if (!errorElement) {
                        errorElement = document.createElement('div');
                        errorElement.id = 'company_tin_error';
                        errorElement.className = 'invalid-feedback';
                        companyTinInput.parentNode.appendChild(errorElement);
                    }
                    errorElement.textContent = 'TIN / Company Code is required';

                    if (isValid) companyTinInput.focus();
                    isValid = false;
                }

                // Validate registration number based on type
                const registrationType = registrationTypeSelect.value;
                const registrationNumber = registrationNumberInput.value.trim();

                if (!registrationNumber) {
                    registrationNumberInput.classList.add('is-invalid');

                    let errorElement = document.getElementById('registration_number_error');
                    if (!errorElement) {
                        errorElement = document.createElement('div');
                        errorElement.id = 'registration_number_error';
                        errorElement.className = 'invalid-feedback';
                        registrationNumberInput.parentNode.appendChild(errorElement);
                    }
                    errorElement.textContent = `${registrationType} number is required`;

                    if (isValid) registrationNumberInput.focus();
                    isValid = false;
                } else {
                    // Additional validation for specific types
                    if (registrationType === 'Patent' && registrationNumber.length < 3) {
                        registrationNumberInput.classList.add('is-invalid');

                        let errorElement = document.getElementById('registration_number_error');
                        if (!errorElement) {
                            errorElement = document.createElement('div');
                            errorElement.id = 'registration_number_error';
                            errorElement.className = 'invalid-feedback';
                            registrationNumberInput.parentNode.appendChild(errorElement);
                        }
                        errorElement.textContent = 'Patent number must be at least 3 characters long';

                        if (isValid) registrationNumberInput.focus();
                        isValid = false;
                    }

                    if (registrationType === 'RCA Number' && !/^\d+$/.test(registrationNumber)) {
                        registrationNumberInput.classList.add('is-invalid');

                        let errorElement = document.getElementById('registration_number_error');
                        if (!errorElement) {
                            errorElement = document.createElement('div');
                            errorElement.id = 'registration_number_error';
                            errorElement.className = 'invalid-feedback';
                            registrationNumberInput.parentNode.appendChild(errorElement);
                        }
                        errorElement.textContent = 'RCA Number must contain only numbers';

                        if (isValid) registrationNumberInput.focus();
                        isValid = false;
                    }
                }

                if (!isValid) {
                    e.preventDefault();
                }
            });
        }
    }
});