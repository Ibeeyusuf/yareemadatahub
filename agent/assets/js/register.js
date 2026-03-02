document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;

    window.nextStep = function(step) {
        if (!validateStep(currentStep)) {
            return;
        }

        document.getElementById(`step${currentStep}-content`).classList.add('hidden');
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}`).classList.add('completed');

        currentStep = step;
        document.getElementById(`step${currentStep}-content`).classList.remove('hidden');
        document.getElementById(`step${currentStep}`).classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.prevStep = function(step) {
        document.getElementById(`step${currentStep}-content`).classList.add('hidden');
        document.getElementById(`step${currentStep}`).classList.remove('active');

        currentStep = step;
        document.getElementById(`step${currentStep}-content`).classList.remove('hidden');
        document.getElementById(`step${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.remove('completed');

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

    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
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
            
            UI.showLoading('submit-btn', 'submit-spinner');
            
            try {
                const result = await Auth.register(formData);
                
                UI.hideLoading('submit-btn', 'submit-spinner');
                
                if (result.success) {
                    UI.showSuccess('registration-error', result.message || 'Registration successful! Please check your email for verification.');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                } else {
                    UI.showError('registration-error', result.message || 'Registration failed. Please try again.');
                    document.getElementById('registration-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } catch (error) {
                UI.hideLoading('submit-btn', 'submit-spinner');
                UI.showError('registration-error', 'Network error. Please check your connection and try again.');
            }
        });
    }
});