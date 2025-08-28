// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                setLoginLoading(true);
                clearErrors();

                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1000);
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
            } finally {
                setLoginLoading(false);
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            try {
                setRegisterLoading(true);
                clearErrors();

                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(result.message, 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    if (result.errors) {
                        Object.keys(result.errors).forEach(field => {
                            showFieldError(field, result.errors[field]);
                        });
                    } else {
                        showMessage(result.error, 'error');
                    }
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
            } finally {
                setRegisterLoading(false);
            }
        });
    }

    // Utility functions
    function setLoginLoading(loading) {
        const btn = document.getElementById('loginBtn');
        const text = document.getElementById('loginText');
        if (loading) {
            btn.disabled = true;
            text.textContent = 'Logging in...';
        } else {
            btn.disabled = false;
            text.textContent = 'Login';
        }
    }

    function setRegisterLoading(loading) {
        const btn = document.getElementById('registerBtn');
        const text = document.getElementById('registerText');
        if (loading) {
            btn.disabled = true;
            text.textContent = 'Creating Account...';
        } else {
            btn.disabled = false;
            text.textContent = 'Create Account';
        }
    }

    function clearErrors() {
        document.querySelectorAll('.field-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function showMessage(message, type = 'error') {
        const messagesContainer = document.getElementById('loginMessages') ||
                                document.getElementById('registerMessages');
        if (messagesContainer) {
            const div = document.createElement('div');
            div.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'}`;
            div.innerHTML = message;
            messagesContainer.innerHTML = '';
            messagesContainer.appendChild(div);
        }
    }
});