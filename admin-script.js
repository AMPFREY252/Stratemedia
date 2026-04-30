// Fixed Admin System with Firebase Authentication

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
    
    // Firebase Auth for Admin
    let currentUser = null;
    
    // Admin Login
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            console.log('Login attempt:', username, password);
            
            // Simple credential check
            if (username === 'Ampfrey' && password === 'Strate.15') {
                console.log('Login successful!');
                
                // Authenticate with Firebase
                try {
                    // Sign in to Firebase with email/password
                    const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
                    const userCredential = await signInWithEmailAndPassword(window.firebase.auth(), 'ampfreytukwasibwe@gmail.com', 'Strate.15');
                    currentUser = userCredential.user;
                    
                    // Show admin panel
                    loginForm.style.display = 'none';
                    adminPanel.style.display = 'block';
                    
                    // Load messages and stats
                    loadMessages();
                    updateStats();
                    
                } catch (error) {
                    console.error('Authentication error:', error);
                    alert('Login failed: ' + error.message);
                }
            } else {
                console.log('Login failed');
                alert('Invalid username or password');
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (window.firebase && window.firebase.auth()) {
                window.firebase.auth().signOut();
            }
            currentUser = null;
            adminPanel.style.display = 'none';
            loginForm.style.display = 'block';
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
        });
    }
    
    // Refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            if (currentUser) {
                loadMessages();
                updateStats();
            }
        });
    }
    
    // Filter and Search
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            if (currentUser) {
                displayMessages();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (currentUser) {
                displayMessages();
            }
        });
    }
    
    // Load Messages from Firebase
    async function loadMessages() {
        console.log('Loading messages...');
        
        if (!currentUser) {
            console.error('No authenticated user');
            return;
        }
        
        messagesList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';
        
        // Check if Firebase is available
        if (!window.database) {
            throw new Error('Firebase database not available');
        }
        
        try {
            // Import Firebase functions
            const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
            
            // Real-time listener
            onValue(ref(window.database, 'contacts'), (snapshot) => {
                const messages = snapshot.val();
                
                if (messages) {
                    window.allMessages = Object.entries(messages);
                    displayMessages();
                    updateStats();
                } else {
                    messagesList.innerHTML = '<div class="no-messages"><i class="fas fa-inbox"></i><p>No messages yet</p></div>';
                    updateStats();
                }
            }, (error) => {
                console.error('Firebase error:', error);
                messagesList.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><p>Error loading messages: ' + error.message + '</p></div>';
            });
            
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesList.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><p>Error: ' + error.message + '</p></div>';
        }
    }
    
    // Display Messages
    function displayMessages() {
        if (!window.allMessages) return;
        
        let filteredMessages = [...window.allMessages];
        
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
        
        // Display messages
        if (filteredMessages.length === 0) {
            messagesList.innerHTML = '<div class="no-messages"><i class="fas fa-inbox"></i><p>No messages found</p></div>';
            return;
        }
        
        const messagesHTML = filteredMessages.map(([key, message]) => `
            <div class="message-item">
                <div class="message-header">
                    <div class="message-info">
                        <h4>${message.name}</h4>
                        <p><i class="fas fa-envelope"></i> ${message.email}</p>
                        <p><i class="fas fa-clock"></i> ${new Date(message.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="message-actions">
                        <button class="btn btn-sm btn-primary" onclick="replyToMessage('${key}', '${message.name}', '${message.email}', '${message.subject}')">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMessage('${key}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="message-content">
                    <h5>Subject: ${message.subject}</h5>
                    <p>${message.message}</p>
                </div>
            </div>
        `).join('');
        
        messagesList.innerHTML = messagesHTML;
    }
    
    // Update Statistics
    function updateStats() {
        if (!window.allMessages) {
            if (totalMessages) totalMessages.textContent = '0';
            if (todayMessages) todayMessages.textContent = '0';
            if (recentMessages) recentMessages.textContent = '0';
            if (unreadMessages) unreadMessages.textContent = '0';
            return;
        }
        
        const now = new Date();
        const today = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let todayCount = 0;
        let recentCount = 0;
        
        window.allMessages.forEach(([key, message]) => {
            const messageDate = new Date(message.timestamp);
            if (messageDate.toDateString() === today) {
                todayCount++;
            }
            if (messageDate >= weekAgo) {
                recentCount++;
            }
        });
        
        if (totalMessages) totalMessages.textContent = window.allMessages.length;
        if (todayMessages) todayMessages.textContent = todayCount;
        if (recentMessages) recentMessages.textContent = recentCount;
        if (unreadMessages) unreadMessages.textContent = window.allMessages.length; // All are unread for demo
    }
    
    // Reply to Message
    window.replyToMessage = function(messageId, name, email, subject) {
        const replySubject = `Re: ${subject}`;
        const replyMessage = prompt(`Reply to ${name} (${email}):\n\nSubject: ${subject}\n\nYour reply:`);
        
        if (replyMessage) {
            saveReply(email, replySubject, replyMessage);
        }
    };
    
    // Delete Message
    window.deleteMessage = async function(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }
        
        try {
            const { remove } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
            await remove(ref(window.database, `contacts/${messageId}`));
            console.log('Message deleted:', messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Error deleting message: ' + error.message);
        }
    };
    
    // Save Reply
    async function saveReply(to, subject, message) {
        try {
            const { set } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
            const replyData = {
                to: to,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString()
            };
            
            await set(ref(window.database, `replies/${Date.now()}`), replyData);
            console.log('Reply saved:', replyData);
            alert('Reply sent successfully!');
        } catch (error) {
            console.error('Error saving reply:', error);
            alert('Error sending reply: ' + error.message);
        }
    }
    
    console.log('Admin system initialized');
});
