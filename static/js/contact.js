// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const charCount = document.getElementById('charCount');
    const messageField = document.getElementById('message');
    const messagesContainer = document.getElementById('contactMessages');

    // Character counter
    if (messageField && charCount) {
        messageField.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;

            if (count > 2000) {
                charCount.style.color = 'var(--err)';
            } else if (count > 1800) {
                charCount.style.color = 'var(--warn)';
            } else {
                charCount.style.color = 'var(--muted)';
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous errors
            clearErrors();

            // Validate form
            if (!validateForm()) {
                return;
            }

            // Show loading state
            setSubmitLoading(true);

            // Prepare form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
                    form.reset();
                    if (charCount) charCount.textContent = '0';
                } else {
                    showMessage(result.error || 'Failed to send message. Please try again.', 'error');

                    // Show field-specific errors if available
                    if (result.errors) {
                        Object.keys(result.errors).forEach(field => {
                            showFieldError(field, result.errors[field]);
                        });
                    }
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showMessage('Network error. Please check your connection and try again.', 'error');
            } finally {
                setSubmitLoading(false);
            }
        });
    }

    // Utility functions
    function validateForm() {
        let isValid = true;

        // Name validation
        const name = document.getElementById('name').value.trim();
        if (!name) {
            showFieldError('name', 'Name is required');
            isValid = false;
        } else if (name.length < 2) {
            showFieldError('name', 'Name must be at least 2 characters');
            isValid = false;
        }

        // Email validation
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Subject validation
        const subject = document.getElementById('subject').value;
        if (!subject) {
            showFieldError('subject', 'Please select a subject');
            isValid = false;
        }

        // Message validation
        const message = document.getElementById('message').value.trim();
        if (!message) {
            showFieldError('message', 'Message is required');
            isValid = false;
        } else if (message.length < 10) {
            showFieldError('message', 'Message must be at least 10 characters');
            isValid = false;
        } else if (message.length > 2000) {
            showFieldError('message', 'Message must be less than 2000 characters');
            isValid = false;
        }

        // Privacy checkbox validation
        const privacy = document.getElementById('privacy').checked;
        if (!privacy) {
            showFieldError('privacy', 'You must agree to the privacy policy');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        // Add error styling to field
        const field = document.getElementById(fieldName);
        if (field) {
            field.classList.add('field-error-state');
        }
    }

    function clearErrors() {
        // Clear all error messages
        document.querySelectorAll('.field-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });

        // Remove error styling from fields
        document.querySelectorAll('.field-error-state').forEach(el => {
            el.classList.remove('field-error-state');
        });
    }

    function showMessage(message, type = 'error') {
        const div = document.createElement('div');
        div.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'}`;
        div.innerHTML = message;

        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(div);

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                if (div.parentNode) {
                    div.remove();
                }
            }, 8000);
        }

        // Scroll to message
        div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function setSubmitLoading(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitText.textContent = 'Sending...';
        } else {
            submitBtn.disabled = false;
            submitText.textContent = 'Send Message';
        }
    }
});