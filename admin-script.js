// Clean Admin System - Simple and Working

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing admin system...');
    
    // Get DOM elements
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const messagesList = document.getElementById('messagesList');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterSelect = document.getElementById('filterSelect');
    const searchInput = document.getElementById('searchInput');
    
    // Statistics elements
    const totalMessages = document.getElementById('totalMessages');
    const todayMessages = document.getElementById('todayMessages');
    const recentMessages = document.getElementById('recentMessages');
    const unreadMessages = document.getElementById('unreadMessages');
    
    console.log('DOM elements found:', {
        adminLoginForm: !!adminLoginForm,
        loginForm: !!loginForm,
        adminPanel: !!adminPanel,
        messagesList: !!messagesList
    });
    
    // Admin Login
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            console.log('Login attempt:', username, password);
            
            // Simple credential check
            if (username === 'Ampfrey' && password === 'Strate.15') {
                console.log('Login successful!');
                
                // Show admin panel
                loginForm.style.display = 'none';
                adminPanel.style.display = 'block';
                
                // Load messages and stats
                loadMessages();
                updateStats();
                
                // Clear form
                adminLoginForm.reset();
                
                showNotification('Login successful! Welcome to admin panel.', 'success');
            } else {
                console.log('Login failed');
                showNotification('Invalid credentials. Please try again.', 'error');
                
                // Clear password
                document.getElementById('adminPassword').value = '';
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            loginForm.style.display = 'block';
            adminPanel.style.display = 'none';
            messagesList.innerHTML = '';
            showNotification('Logged out successfully', 'success');
        });
    }
    
    // Refresh messages
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadMessages();
            updateStats();
            showNotification('Messages refreshed', 'success');
        });
    }
    
    // Filter messages
    if (filterSelect) {
        filterSelect.addEventListener('change', loadMessages);
    }
    
    // Search messages
    if (searchInput) {
        searchInput.addEventListener('input', loadMessages);
    }
    
    // Load Messages from Firebase
    async function loadMessages() {
        if (!messagesList) return;
        
        try {
            messagesList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';
            
            // Check if Firebase is available
            if (!window.database) {
                throw new Error('Firebase database not available');
            }
            
            // Import Firebase functions - FIXED
            const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
            
            // Real-time listener
            onValue(ref(window.database, 'contacts'), (snapshot) => {
                const messages = snapshot.val();
                
                if (messages) {
                    let filteredMessages = Object.entries(messages);
                    
                    // Apply filters
                    const filterValue = filterSelect?.value || 'all';
                    const searchTerm = searchInput?.value.toLowerCase() || '';
                    
                    if (filterValue !== 'all') {
                        const now = new Date();
                        filteredMessages = filteredMessages.filter(([key, message]) => {
                            const messageDate = new Date(message.timestamp);
                            switch (filterValue) {
                                case 'today':
                                    return messageDate.toDateString() === now.toDateString();
                                case 'week':
                                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                    return messageDate >= weekAgo;
                                case 'month':
                                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                    return messageDate >= monthAgo;
                                default:
                                    return true;
                            }
                        });
                    }
                    
                    if (searchTerm) {
                        filteredMessages = filteredMessages.filter(([key, message]) => {
                            return message.name.toLowerCase().includes(searchTerm) ||
                                   message.email.toLowerCase().includes(searchTerm) ||
                                   message.subject.toLowerCase().includes(searchTerm) ||
                                   message.message.toLowerCase().includes(searchTerm);
                        });
                    }
                    
                    // Sort by timestamp (newest first)
                    filteredMessages.sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
                    
                    messagesList.innerHTML = '';
                    
                    if (filteredMessages.length === 0) {
                        messagesList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No messages found.</p>';
                    } else {
                        filteredMessages.forEach(([key, message]) => {
                            const messageElement = createMessageElement(message, key);
                            messagesList.appendChild(messageElement);
                        });
                    }
                } else {
                    messagesList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No messages yet.</p>';
                }
            });
            
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">Error loading messages.</p>';
        }
    }
    
    // Create Message Element
    function createMessageElement(message, key) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-item ${message.read ? 'read' : 'unread'}`;
        messageDiv.setAttribute('data-key', key);
        
        const date = new Date(message.timestamp).toLocaleString();
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div>
                    <h4>${message.name} - ${message.subject}</h4>
                    <div class="message-meta">
                        <span><i class="fas fa-envelope"></i> ${message.email}</span>
                        <span><i class="fas fa-clock"></i> ${date}</span>
                        <span class="status-badge ${message.status}">${message.status}</span>
                    </div>
                </div>
            </div>
            <div class="message-content">
                ${message.message}
            </div>
            <div class="message-actions">
                <button class="btn btn-secondary" onclick="markAsRead('${key}')">
                    <i class="fas fa-envelope-open"></i> Mark as Read
                </button>
                <button class="btn btn-primary" onclick="replyToMessage('${key}')">
                    <i class="fas fa-reply"></i> Reply
                </button>
                <button class="btn btn-danger" onclick="deleteMessage('${key}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return messageDiv;
    }
    
    // Update Statistics
    async function updateStats() {
        try {
            if (!window.database) {
                console.log('Firebase not available, skipping stats update');
                return;
            }
            
            // Import Firebase functions - FIXED
            const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
            
            onValue(ref(window.database, 'contacts'), (snapshot) => {
                const messages = snapshot.val();
                
                if (messages) {
                    const messageArray = Object.values(messages);
                    const now = new Date();
                    const today = now.toDateString();
                    
                    let totalCount = messageArray.length;
                    let todayCount = 0;
                    let recentCount = 0;
                    let unreadCount = 0;
                    
                    messageArray.forEach(message => {
                        const messageDate = new Date(message.timestamp);
                        
                        if (messageDate.toDateString() === today) {
                            todayCount++;
                        }
                        
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (messageDate >= weekAgo) {
                            recentCount++;
                        }
                        
                        if (!message.read) {
                            unreadCount++;
                        }
                    });
                    
                    if (totalMessages) totalMessages.textContent = totalCount;
                    if (todayMessages) todayMessages.textContent = todayCount;
                    if (recentMessages) recentMessages.textContent = recentCount;
                    if (unreadMessages) unreadMessages.textContent = unreadCount;
                } else {
                    if (totalMessages) totalMessages.textContent = '0';
                    if (todayMessages) todayMessages.textContent = '0';
                    if (recentMessages) recentMessages.textContent = '0';
                    if (unreadMessages) unreadMessages.textContent = '0';
                }
            });
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    // Make functions globally available
    window.markAsRead = async function(key) {
        if (!window.database) return;
        
        try {
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
            await update(ref(window.database, `contacts/${key}`), { read: true });
            showNotification('Message marked as read', 'success');
        } catch (error) {
            console.error('Error marking as read:', error);
            showNotification('Failed to mark as read', 'error');
        }
    };
    
    window.replyToMessage = function(key) {
        if (!window.database) return;
        
        // Get message details
        const getAndShowReplyModal = async () => {
            try {
                const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
                onValue(ref(window.database, `contacts/${key}`), (snapshot) => {
                    const message = snapshot.val();
                    if (message) {
                        showReplyModal(message, key);
                    }
                });
            } catch (error) {
                console.error('Error getting message for reply:', error);
                showNotification('Failed to load message for reply', 'error');
            }
        };
        
        getAndShowReplyModal();
    };
    
    // Show Reply Modal
    function showReplyModal(message, key) {
        // Create modal HTML
        const modalHTML = `
            <div class="reply-modal-overlay" id="replyModalOverlay">
                <div class="reply-modal">
                    <div class="reply-modal-header">
                        <h3><i class="fas fa-reply"></i> Reply to Message</h3>
                        <button class="close-btn" onclick="closeReplyModal()">&times;</button>
                    </div>
                    <div class="reply-modal-body">
                        <div class="original-message">
                            <h4>Original Message</h4>
                            <p><strong>From:</strong> ${message.name} (${message.email})</p>
                            <p><strong>Subject:</strong> ${message.subject}</p>
                            <p><strong>Message:</strong> ${message.message}</p>
                        </div>
                        <form id="replyForm">
                            <div class="form-group">
                                <label for="replySubject">Reply Subject</label>
                                <input type="text" id="replySubject" value="Re: ${message.subject}" required>
                            </div>
                            <div class="form-group">
                                <label for="replyMessage">Reply Message</label>
                                <textarea id="replyMessage" rows="6" placeholder="Type your reply here..." required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="attachment">Attachment (Optional)</label>
                                <input type="file" id="attachment" accept=".pdf,.doc,.docx,.txt,.jpg,.png">
                                <small>Maximum file size: 5MB</small>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-paper-plane"></i> Send Reply
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="closeReplyModal()">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup form submission
        const replyForm = document.getElementById('replyForm');
        if (replyForm) {
            replyForm.addEventListener('submit', function(e) {
                e.preventDefault();
                sendReply(message, key);
            });
        }
    }
    
    // Send Reply Function
    async function sendReply(originalMessage, key) {
        try {
            const replySubject = document.getElementById('replySubject').value;
            const replyMessage = document.getElementById('replyMessage').value;
            const attachmentFile = document.getElementById('attachment').files[0];
            
            // Show loading
            showNotification('Sending reply...', 'warning');
            
            // Create reply data
            const replyData = {
                to: originalMessage.email,
                toName: originalMessage.name,
                subject: replySubject,
                message: replyMessage,
                originalSubject: originalMessage.subject,
                originalMessage: originalMessage.message,
                timestamp: new Date().toISOString(),
                status: 'sent'
            };
            
            // Save reply to Firebase
            if (window.database) {
                const { ref, push } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
                await push(ref(window.database, 'replies'), replyData);
            }
            
            // Update original message status
            if (window.database) {
                const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
                await update(ref(window.database, `contacts/${key}`), { 
                    replied: true, 
                    status: 'replied',
                    repliedAt: new Date().toISOString()
                });
            }
            
            // Send email (using EmailJS or similar service)
            await sendEmailReply(originalMessage, replyData, attachmentFile);
            
            // Close modal and show success
            closeReplyModal();
            showNotification('Reply sent successfully!', 'success');
            
        } catch (error) {
            console.error('Error sending reply:', error);
            showNotification('Failed to send reply. Please try again.', 'error');
        }
    }
    
    // Send Email Reply (using EmailJS or similar)
    async function sendEmailReply(originalMessage, replyData, attachmentFile) {
        // This is where you would integrate with an email service
        // For now, we'll simulate the email sending
        
        console.log('Sending email reply:', {
            to: originalMessage.email,
            subject: replyData.subject,
            message: replyData.message,
            attachment: attachmentFile ? attachmentFile.name : null
        });
        
        // You can integrate with:
        // 1. EmailJS (free tier available)
        // 2. SendGrid API
        // 3. Mailgun API
        // 4. Your own backend service
        
        // Example with EmailJS (you'll need to set up an account):
        /*
        emailjs.send('your_service_id', 'your_template_id', {
            to_email: originalMessage.email,
            to_name: originalMessage.name,
            subject: replyData.subject,
            message: replyData.message,
            reply_from: 'Ampfrey Tukwasibwe <ampfrey@example.com>'
        }).then(function(response) {
            console.log('Email sent successfully!', response);
        }, function(error) {
            console.log('Email failed...', error);
        });
        */
        
        return Promise.resolve();
    }
    
    // Close Reply Modal
    window.closeReplyModal = function() {
        const modal = document.getElementById('replyModalOverlay');
        if (modal) {
            modal.remove();
        }
    };
    
    window.deleteMessage = async function(key) {
        if (!window.database) return;
        
        if (confirm('Are you sure you want to delete this message?')) {
            try {
                const { ref, remove } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
                await remove(ref(window.database, `contacts/${key}`));
                showNotification('Message deleted', 'success');
            } catch (error) {
                console.error('Error deleting message:', error);
                showNotification('Failed to delete message', 'error');
            }
        }
    };
    
    // Show Notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    console.log('Admin system initialized successfully!');
});
