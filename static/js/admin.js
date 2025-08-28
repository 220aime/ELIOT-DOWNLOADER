// Admin panel functionality
document.addEventListener('DOMContentLoaded', function() {
    // User search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const userRows = document.querySelectorAll('.user-row');

            userRows.forEach(row => {
                const username = row.querySelector('.user-name').textContent.toLowerCase();
                const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

                if (username.includes(searchTerm) || email.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Filter buttons for inbox
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter messages
            const filter = this.getAttribute('data-filter');
            const messages = document.querySelectorAll('.message-item');

            messages.forEach(message => {
                const status = message.getAttribute('data-status');
                if (filter === 'all' || status === filter) {
                    message.style.display = '';
                } else {
                    message.style.display = 'none';
                }
            });
        });
    });

    // Mark message as read/unread
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('mark-read') || e.target.classList.contains('mark-unread')) {
            const messageId = e.target.getAttribute('data-message-id');
            const isMarkingRead = e.target.classList.contains('mark-read');

            try {
                const response = await fetch(`/admin/message/${messageId}/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: isMarkingRead ? 'read' : 'unread'
                    })
                });

                if (response.ok) {
                    location.reload(); // Simple reload for now
                }
            } catch (error) {
                console.error('Error updating message status:', error);
            }
        }
    });

    // Reply modal
    const replyBtns = document.querySelectorAll('.reply-btn');
    const replyModal = document.getElementById('replyModal');

    replyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const name = this.getAttribute('data-name');

            document.getElementById('replyTo').value = email;
            document.getElementById('replySubject').value = `Re: Message from ${name}`;

            replyModal.style.display = 'flex';
        });
    });

    // Close modal
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Change password form
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(passwordForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/admin/change_password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(result.message, 'success');
                    passwordForm.reset();
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Password change failed', 'error');
            }
        });
    }

    function showMessage(message, type = 'error') {
        const messagesContainer = document.getElementById('passwordMessages');
        if (messagesContainer) {
            const div = document.createElement('div');
            div.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'}`;
            div.innerHTML = message;
            messagesContainer.innerHTML = '';
            messagesContainer.appendChild(div);
        }
    }
});