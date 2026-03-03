let currentStep = 1;
        const totalSteps = 5;

        // Form data storage
        const formData = {};

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Set max date for date of birth (18 years ago)
            const dobInput = document.getElementById('dateOfBirth');
            const today = new Date();
            const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            dobInput.max = maxDate.toISOString().split('T')[0];

            // Set min date for start date (today)
            const startDateInput = document.getElementById('startDate');
            startDateInput.min = today.toISOString().split('T')[0];

            // Phone number formatting
            document.getElementById('phone').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    if (value.length <= 3) {
                        value = `(${value}`;
                    } else if (value.length <= 6) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                    } else {
                        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                    }
                }
                e.target.value = value;
            });

            // Password strength checker
            document.getElementById('password').addEventListener('input', checkPasswordStrength);

            // File upload preview
            document.getElementById('profilePhoto').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const label = document.querySelector('.file-upload-label');
                        label.innerHTML = `
                            <div class="file-upload-content">
                                <img src="${e.target.result}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
                                <p>${file.name}</p>
                                <small>Click to change photo</small>
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Real-time validation
            const inputs = document.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    validateField(this);
                });
            });
        });

        function changeStep(direction) {
            const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            
            if (direction === 1) {
                // Validate current step before proceeding
                if (!validateStep(currentStep)) {
                    return;
                }
                
                // Save form data
                saveStepData(currentStep);
                
                if (currentStep === 4) {
                    // Submit form
                    submitForm();
                    return;
                }
            }

            // Hide current step
            currentStepElement.classList.remove('active');
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
            
            // Update step number
            currentStep += direction;
            
            // Show new step
            const newStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            newStepElement.classList.add('active');
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
            
            // Update progress bar
            updateProgressBar();
            
            // Update buttons
            updateButtons();
            
            // Scroll to top
            document.querySelector('.form-container').scrollTop = 0;
        }

        function validateStep(step) {
            let isValid = true;
            const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
            const requiredFields = stepElement.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            // Special validation for step 4
            if (step === 4) {
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const terms = document.getElementById('terms').checked;
                
                if (password !== confirmPassword) {
                    showError('confirmPasswordError');
                    isValid = false;
                }
                
                if (!terms) {
                    showError('termsError');
                    isValid = false;
                }
                
                if (!isPasswordStrong(password)) {
                    showError('passwordError');
                    isValid = false;
                }
            }
            
            return isValid;
        }

        function validateField(field) {
            const value = field.value.trim();
            const errorElement = document.getElementById(field.id + 'Error');
            
            // Remove previous error state
            field.classList.remove('error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            
            // Check if field is empty
            if (field.hasAttribute('required') && !value) {
                field.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
                return false;
            }
            
            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    field.classList.add('error');
                    if (errorElement) {
                        errorElement.classList.add('show');
                    }
                    return false;
                }
            }
            
            // Phone validation
            if (field.id === 'phone' && value) {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                if (!phoneRegex.test(value)) {
                    field.classList.add('error');
                    if (errorElement) {
                        errorElement.classList.add('show');
                    }
                    return false;
                }
            }
            
            // Date of birth validation
            if (field.id === 'dateOfBirth' && value) {
                const dob = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                
                if (age < 18 || (age === 18 && monthDiff < 0)) {
                    field.classList.add('error');
                    if (errorElement) {
                        errorElement.classList.add('show');
                    }
                    return false;
                }
            }
            
            // ZIP code validation
            if (field.id === 'zipCode' && value) {
                const zipRegex = /^\d{5}(-\d{4})?$/;
                if (!zipRegex.test(value)) {
                    field.classList.add('error');
                    if (errorElement) {
                        errorElement.classList.add('show');
                    }
                    return false;
                }
            }
            
            return true;
        }

        function checkPasswordStrength() {
            const password = document.getElementById('password').value;
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');
            
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/)) strength++;
            if (password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;
            
            const strengthPercent = (strength / 5) * 100;
            strengthBar.style.width = strengthPercent + '%';
            
            if (strength <= 2) {
                strengthBar.style.background = 'var(--danger)';
                strengthText.textContent = 'Weak password';
                strengthText.style.color = 'var(--danger)';
            } else if (strength <= 3) {
                strengthBar.style.background = 'var(--warning)';
                strengthText.textContent = 'Medium strength';
                strengthText.style.color = 'var(--warning)';
            } else {
                strengthBar.style.background = 'var(--secondary)';
                strengthText.textContent = 'Strong password';
                strengthText.style.color = 'var(--secondary)';
            }
        }

        function isPasswordStrong(password) {
            return password.length >= 8 &&
                   password.match(/[a-z]/) &&
                   password.match(/[A-Z]/) &&
                   password.match(/[0-9]/) &&
                   password.match(/[^a-zA-Z0-9]/);
        }

        function saveStepData(step) {
            const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
            const inputs = stepElement.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    formData[input.name] = input.checked;
                } else {
                    formData[input.name] = input.value;
                }
            });
        }

        function updateProgressBar() {
            const progress = (currentStep / (totalSteps - 1)) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            
            // Update step indicators
            for (let i = 1; i < currentStep; i++) {
                document.querySelector(`.step[data-step="${i}"]`).classList.add('completed');
            }
        }

        function updateButtons() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            
            // Show/hide previous button
            if (currentStep === 1) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'block';
            }
            
            // Update next button text
            if (currentStep === 4) {
                nextBtn.innerHTML = '<i class="fas fa-check"></i> Submit <span class="loading-spinner"></span><span class="btn-text">Submit</span>';
                nextBtn.classList.remove('btn-primary');
                nextBtn.classList.add('btn-success');
            } else {
                nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i> <span class="loading-spinner"></span><span class="btn-text">Next</span>';
                nextBtn.classList.remove('btn-success');
                nextBtn.classList.add('btn-primary');
            }
        }

        function showError(errorId) {
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.classList.add('show');
            }
        }

        function submitForm() {
            const nextBtn = document.getElementById('nextBtn');
            nextBtn.classList.add('loading');
            nextBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Save all data
                saveStepData(4);
                
                // Show success message
                document.querySelector('.form-step[data-step="4"]').classList.remove('active');
                document.querySelector('.form-step[data-step="5"]').classList.add('active');
                document.querySelector('.step[data-step="4"]').classList.add('completed');
                
                // Update progress to 100%
                document.getElementById('progressBar').style.width = '100%';
                
                // Hide buttons
                document.querySelector('.buttons').style.display = 'none';
                
                // Log form data (in real app, send to server)
                console.log('Form Data Submitted:', formData);
                
                // Show success animation
                const successMessage = document.querySelector('.success-message');
                successMessage.style.display = 'block';
            }, 2000);
        }

        // Prevent form submission on Enter key
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (currentStep < 4) {
                    changeStep(1);
                }
            }
        });