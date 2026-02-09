
document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;

    // Step navigation functions
    window.nextStep = function(step) {
        // Validate current step before proceeding
        if (!validateStep(currentStep)) {
            return;
        }

        // Hide current step
        document.getElementById(`step${currentStep}-content`).classList.add('hidden');
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}`).classList.add('completed');

        // Show next step
        currentStep = step;
        document.getElementById(`step${currentStep}-content`).classList.remove('hidden');
        document.getElementById(`step${currentStep}`).classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.prevStep = function(step) {
        // Hide current step
        document.getElementById(`step${currentStep}-content`).classList.add('hidden');
        document.getElementById(`step${currentStep}`).classList.remove('active');

        // Show previous step
        currentStep = step;
        document.getElementById(`step${currentStep}-content`).classList.remove('hidden');
        document.getElementById(`step${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.remove('completed');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function validateStep(step) {
        const stepContent = document.getElementById(`step${step}-content`);
        const inputs = stepContent.querySelectorAll('input[required], select[required], textarea[required]');
        
        for (let input of inputs) {
            if (!input.value.trim()) {
                UI.showError('registration-error', 'Please fill in all required fields');
                input.focus();
                return false;
            }
        }
        
        // Additional validation for step 1 (personal info)
        if (step === 1) {
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            
            if (phone.length !== 11 || !phone.startsWith('0')) {
                UI.showError('registration-error', 'Phone number must be 11 digits starting with 0 (e.g., 08012345678)');
                return false;
            }
            
            if (!Utils.isValidEmail(email)) {
                UI.showError('registration-error', 'Please enter a valid email address');
                return false;
            }
        }
        
        // Additional validation for step 2 (business info)
        if (step === 2) {
            const accountNumber = document.getElementById('account-number').value.trim();
            if (accountNumber.length !== 10 || isNaN(accountNumber)) {
                UI.showError('registration-error', 'Account number must be exactly 10 digits');
                return false;
            }
        }

        UI.hideMessage('registration-error');
        return true;
    }

    window.togglePassword = function(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // Registration form submission
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate passwords match
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password.length < 8) {
                UI.showError('registration-error', 'Password must be at least 8 characters');
                return;
            }
            
            if (!Utils.isStrongPassword(password)) {
                UI.showError('registration-error', 'Password must contain uppercase, lowercase, number and special character');
                return;
            }
            
            if (password !== confirmPassword) {
                UI.showError('registration-error', 'Passwords do not match');
                return;
            }
            
            if (!document.getElementById('terms').checked) {
                UI.showError('registration-error', 'Please accept the terms and conditions');
                return;
            }
            
            UI.hideMessage('registration-error');
            
            // CRITICAL: Collect form data - EXACT match to API requirements (NO BVN, NO NIN, NO Transaction PIN)
            const bankSelect = document.getElementById('bank-name');
            const bankName = bankSelect.options[bankSelect.selectedIndex].text;
            
            const formData = {
                firstName: document.getElementById('first-name').value.trim(),
                lastName: document.getElementById('last-name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phone').value.trim(),
                password: password,
                businessName: document.getElementById('business-name').value.trim(),
                businessAddress: document.getElementById('business-address').value.trim(),
                bankName: bankName,
                accountNumber: document.getElementById('account-number').value.trim(),
                accountName: document.getElementById('account-name').value.trim()
            };
            
            console.log('Registration payload (API-compliant):', formData);
            
            // Show loading
            UI.showLoading('submit-btn', 'submit-spinner');
            
            try {
                // Call registration API
                const result = await Auth.register(formData);
                
                // Hide loading
                UI.hideLoading('submit-btn', 'submit-spinner');
                
                if (result.success) {
                    // Show success message
                    UI.showSuccess('registration-error', result.message || 'Registration successful! Please check your email for verification.');
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                } else {
                    // Show error
                    UI.showError('registration-error', result.message || 'Registration failed. Please try again.');
                    // Scroll to error message
                    document.getElementById('registration-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } catch (error) {
                // Hide loading
                UI.hideLoading('submit-btn', 'submit-spinner');
                
                // Show error
                UI.showError('registration-error', 'Network error. Please check your connection and try again.');
                console.error('Registration error:', error);
            }
        });
    }
});
