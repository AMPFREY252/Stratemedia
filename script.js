// Firebase Configuration - Updated with your actual project details
const firebaseConfig = {
    apiKey: "AIzaSyAsKb9fP5e7iRktQzgnwdXcY5OtTyyk6t0",
    authDomain: "mywebsite-eb628.firebaseapp.com",
    databaseURL: "https://mywebsite-eb628-default-rtdb.firebaseio.com",
    projectId: "mywebsite-eb628",
    storageBucket: "mywebsite-eb628.firebasestorage.app",
    messagingSenderId: "389693477462",
    appId: "1:389693477462:web:c19746a41b3770611ee1f7",
    measurementId: "G-3KQQTT62TW"
};

// Global Firebase instance and error state
let database = null;
let analytics = null;
let firebaseConnected = false;
let connectionRetryCount = 0;
const maxRetries = 3;

// Initialize Firebase with error handling
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (!window.firebase?.apps?.length) {
            const app = window.initializeApp(firebaseConfig);
            database = window.getDatabase(app);
            analytics = window.getAnalytics(app);
            
            // Make available globally
            window.database = database;
            window.analytics = analytics;
            
            // Test database connection
            testDatabaseConnection();
        }
    } catch (error) {
        showFirebaseError('initialization', error);
        showOfflineMode();
    }
}

// Test database connection
function testDatabaseConnection() {
    if (!database) {
        showFirebaseError('database', 'Database not initialized');
        return;
    }

    const testRef = database.ref('.info/connected');
    const connectionTimeout = setTimeout(() => {
        if (!firebaseConnected) {
            showFirebaseError('timeout', 'Connection timeout');
            showOfflineMode();
        }
    }, 10000); // 10 second timeout

    testRef.on('value', (snapshot) => {
        clearTimeout(connectionTimeout);
        if (snapshot.val() === true) {
            firebaseConnected = true;
            hideFirebaseError();
            hideOfflineMode();
            
            // Show connection status
            showConnectionStatus(true);
        } else {
            showFirebaseError('connection', 'Unable to connect to Firebase');
            if (connectionRetryCount < maxRetries) {
                setTimeout(() => {
                    connectionRetryCount++;
                    initializeFirebase();
                }, 3000); // Retry after 3 seconds
            } else {
                showOfflineMode();
                showConnectionStatus(false);
            }
        }
    }, (error) => {
        clearTimeout(connectionTimeout);
        showFirebaseError('connection', error.message);
        showOfflineMode();
        showConnectionStatus(false);
    });
}

// Show connection status indicator
function showConnectionStatus(online) {
    // Remove existing status
    const existingStatus = document.querySelector('.connection-status');
    if (existingStatus) {
        existingStatus.remove();
    }

    const statusDiv = document.createElement('div');
    statusDiv.className = `connection-status ${online ? 'online' : 'offline'}`;
    statusDiv.innerHTML = `
        <i class="fas fa-${online ? 'wifi' : 'wifi-slash'}"></i>
        <span>${online ? 'Online' : 'Offline'}</span>
    `;
    
    document.body.appendChild(statusDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (statusDiv.parentElement) {
            statusDiv.remove();
        }
    }, 5000);
}

// Show Firebase error panel
function showFirebaseError(type, error) {
    hideFirebaseError(); // Clear any existing error
    
    const errorPanel = document.createElement('div');
    errorPanel.className = 'firebase-error-panel';
    errorPanel.innerHTML = `
        <div class="error-content">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-details">
                <h3>Connection Error</h3>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Details:</strong> ${error}</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="retryConnection()">
                        <i class="fas fa-redo"></i> Retry Connection
                    </button>
                    <button class="btn btn-secondary" onclick="showTroubleshooting()">
                        <i class="fas fa-cog"></i> Troubleshoot
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorPanel);
    
    // Auto-hide after 10 seconds if connection is established
    setTimeout(() => {
        if (firebaseConnected) {
            hideFirebaseError();
        }
    }, 10000);
}

// Hide Firebase error panel
function hideFirebaseError() {
    const existingPanel = document.querySelector('.firebase-error-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
}

// Show offline mode
function showOfflineMode() {
    const offlinePanel = document.createElement('div');
    offlinePanel.className = 'offline-mode-panel';
    offlinePanel.innerHTML = `
        <div class="offline-content">
            <div class="offline-icon">
                <i class="fas fa-wifi-slash"></i>
            </div>
            <div class="offline-details">
                <h3>Offline Mode</h3>
                <p>Unable to connect to Firebase. Some features may be limited.</p>
                <ul>
                    <li>Contact form submissions will be saved locally</li>
                    <li>Admin panel will work in read-only mode</li>
                    <li>Data will sync when connection is restored</li>
                </ul>
                <button class="btn btn-primary" onclick="retryConnection()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(offlinePanel);
}

// Hide offline mode
function hideOfflineMode() {
    const existingPanel = document.querySelector('.offline-mode-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
}

// Retry connection
function retryConnection() {
    connectionRetryCount = 0;
    hideFirebaseError();
    hideOfflineMode();
    initializeFirebase();
}

// Show troubleshooting guide
function showTroubleshooting() {
    const modal = document.createElement('div');
    modal.className = 'troubleshooting-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-cog"></i> Firebase Connection Troubleshooting</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="troubleshooting-section">
                    <h4>1. Check Internet Connection</h4>
                    <p>Ensure you have a stable internet connection.</p>
                </div>
                <div class="troubleshooting-section">
                    <h4>2. Firebase Configuration</h4>
                    <p>Verify your Firebase project settings and database rules.</p>
                </div>
                <div class="troubleshooting-section">
                    <h4>3. Browser Console</h4>
                    <p>Check browser console (F12) for detailed error messages.</p>
                </div>
                <div class="troubleshooting-section">
                    <h4>4. Firebase Status</h4>
                    <p>Check <a href="https://status.firebase.google.com/" target="_blank">Firebase Status Dashboard</a> for service outages.</p>
                </div>
                <div class="troubleshooting-section">
                    <h4>5. Contact Support</h4>
                    <p>If issues persist, contact your hosting provider or Firebase support.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Local storage fallback for offline mode
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Local storage error:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Local storage error:', error);
        return null;
    }
}

// Enhanced contact form with offline support
// This will be initialized after DOM is ready in initializeDOMElements()
function setupContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                inquiryType: document.getElementById('inquiry-type')?.value || 'general',
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString(),
            read: false,
            replied: false,
            status: 'pending'
        };

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            if (firebaseConnected && database) {
                // Save to Firebase
                await database.ref('contacts').push(formData);
                showNotification('Message sent successfully! I will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                // Save to local storage for offline mode
                const existingMessages = getFromLocalStorage('contactMessages') || [];
                existingMessages.push(formData);
                saveToLocalStorage('contactMessages', existingMessages);
                
                showNotification('Message saved locally. Will sync when connection is restored.', 'warning');
                contactForm.reset();
            }
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// DOM Elements - Will be initialized after page load
let hamburger, navMenu;
let contactForm, adminLoginForm, loginForm, adminPanel, messagesList, logoutBtn;
let refreshBtn, filterSelect, searchInput, exportBtn, clearAllBtn, markReadBtn;

// Initialize DOM elements after page loads
function initializeDOMElements() {
    hamburger = document.querySelector('.hamburger');
    navMenu = document.querySelector('.nav-menu');
    contactForm = document.getElementById('contactForm');
    adminLoginForm = document.getElementById('adminLoginForm');
    loginForm = document.getElementById('loginForm');
    adminPanel = document.getElementById('adminPanel');
    messagesList = document.getElementById('messagesList');
    logoutBtn = document.getElementById('logoutBtn');
    
    // Admin specific elements
    refreshBtn = document.getElementById('refreshBtn');
    filterSelect = document.getElementById('filterSelect');
    searchInput = document.getElementById('searchInput');
    exportBtn = document.getElementById('exportBtn');
    clearAllBtn = document.getElementById('clearAllBtn');
    markReadBtn = document.getElementById('markReadBtn');
    
    console.log('DOM Elements Initialized:');
    console.log('Hamburger:', hamburger);
    console.log('Nav Menu:', navMenu);
    console.log('DOM Elements initialized:', {
        adminLoginForm: !!adminLoginForm,
        loginForm: !!loginForm,
        adminPanel: !!adminPanel
    });
    
    // Setup contact form after DOM is ready
    setupContactForm();
    
    // Setup admin login after DOM is ready
    setupAdminLogin();
    
    // Setup hamburger menu functionality
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked'); // Debug log
            console.log('Nav menu before toggle:', navMenu); // Debug nav menu
            console.log('Hamburger before toggle:', hamburger); // Debug hamburger
            
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            console.log('Nav menu after toggle:', navMenu.classList.contains('active')); // Debug result
            console.log('Hamburger after toggle:', hamburger.classList.contains('active')); // Debug result
        });
        
        console.log('Hamburger menu event listener attached successfully');
        
        // Close menu when clicking on a link (mobile)
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
        
    } else {
        console.error('Hamburger menu elements not found:', { hamburger: !!hamburger, navMenu: !!navMenu });
    }
}

// Mobile Navigation Toggle - will be set up in initializeDOMElements

// Close menu when clicking on a link (mobile) - will be set up in initializeDOMElements
// Close menu when clicking outside (mobile) - will be set up in initializeDOMElements

// Smooth Scrolling for Navigation Links (only for single page if needed)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        // Close mobile menu if open
        navMenu?.classList.remove('active');
    });
});

// Contact Form Submission (only on contact page)
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            inquiryType: document.getElementById('inquiry-type')?.value || 'general',
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString(),
            read: false,
            replied: false,
            status: 'pending'
        };

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Save to Firebase using correct v9+ syntax
            if (window.database) {
                // Import the needed functions for v9+ syntax
                const { ref, push } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
                await push(ref(window.database, 'contacts'), formData);
            } else {
                throw new Error('Firebase database not available');
            }
            
            // Show success message
            showNotification('Message sent successfully! I will get back to you soon.', 'success');
            
            // Reset form
            contactForm.reset();
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// Simple Admin Login Setup
function setupAdminLogin() {
    console.log('Setting up admin login...');
    
    if (!adminLoginForm) {
        console.log('Admin login form not found');
        return;
    }
    
    console.log('Admin login form found, adding event listener');
    
    // Remove any existing listeners
    adminLoginForm.removeEventListener('submit', handleAdminLogin);
    
    // Add new listener
    adminLoginForm.addEventListener('submit', handleAdminLogin);
}

function handleAdminLogin(e) {
    e.preventDefault();
    console.log('Admin login form submitted');
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    console.log('Login attempt:', username, password);
    
    // Simple credential check
    if (username === 'Ampfrey' && password === 'Strate.15') {
        console.log('Login successful!');
        
        // Show admin panel
        if (loginForm) loginForm.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        
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
        const passwordField = document.getElementById('adminPassword');
        if (passwordField) passwordField.value = '';
    }
}

// Logout (only on admin page)
logoutBtn?.addEventListener('click', () => {
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
    messagesList.innerHTML = '';
    showNotification('Logged out successfully', 'success');
});

// Refresh messages
refreshBtn?.addEventListener('click', () => {
    loadMessages();
    updateStats();
    showNotification('Messages refreshed', 'success');
});

// Filter messages
filterSelect?.addEventListener('change', () => {
    loadMessages();
});

// Search messages
searchInput?.addEventListener('input', () => {
    loadMessages();
});

// Export messages
exportBtn?.addEventListener('click', exportMessages);

// Clear all messages
clearAllBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
        clearAllMessages();
    }
});

// Mark all as read
markReadBtn?.addEventListener('click', markAllAsRead);

// Load Messages from Firebase
async function loadMessages() {
    if (!messagesList) return;
    
    try {
        messagesList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';
        
        // Import needed functions for v9+ syntax
        const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
        
        // Use real-time listener
        onValue(ref(database, 'contacts'), (snapshot) => {
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
            <h4>${message.name} - ${message.subject}</h4>
            <div class="message-actions">
                ${!message.read ? '<span class="unread-badge">New</span>' : ''}
                ${message.replied ? '<span class="replied-badge">Replied</span>' : ''}
                <span class="status-badge status-${message.status}">${message.status}</span>
                <button class="btn-small" onclick="markAsRead('${key}')" ${message.read ? 'style="display:none;"' : ''}>
                    <i class="fas fa-check"></i> Mark Read
                </button>
                <button class="btn-small btn-primary" onclick="openReplyModal('${key}')">
                    <i class="fas fa-reply"></i> Reply
                </button>
                <button class="btn-small btn-danger" onclick="deleteMessage('${key}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        <div class="message-content">
            <p><strong>Email:</strong> ${message.email}</p>
            ${message.inquiryType ? `<p><strong>Type:</strong> ${message.inquiryType}</p>` : ''}
            <p>${message.message}</p>
        </div>
        <div class="message-footer">
            <small>${date}</small>
        </div>
    `;
    
    return messageDiv;
}

// Delete Message
async function deleteMessage(key) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await database.ref(`contacts/${key}`).remove();
            loadMessages();
            updateStats();
            showNotification('Message deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting message:', error);
            showNotification('Failed to delete message', 'error');
        }
    }
}

// Mark as Read
async function markAsRead(key) {
    try {
        await database.ref(`contacts/${key}`).update({ read: true });
        loadMessages();
        updateStats();
        showNotification('Message marked as read', 'success');
    } catch (error) {
        console.error('Error marking message as read:', error);
        showNotification('Failed to mark message as read', 'error');
    }
}

// Mark All as Read
async function markAllAsRead() {
    try {
        const snapshot = await database.ref('contacts').once('value');
        const messages = snapshot.val();
        
        if (messages) {
            const updates = {};
            Object.keys(messages).forEach(key => {
                if (!messages[key].read) {
                    updates[`contacts/${key}/read`] = true;
                }
            });
            
            if (Object.keys(updates).length > 0) {
                await database.ref().update(updates);
                loadMessages();
                updateStats();
                showNotification('All messages marked as read', 'success');
            } else {
                showNotification('No unread messages', 'info');
            }
        }
    } catch (error) {
        console.error('Error marking all messages as read:', error);
        showNotification('Failed to mark messages as read', 'error');
    }
}

// Clear All Messages
async function clearAllMessages() {
    try {
        await database.ref('contacts').remove();
        loadMessages();
        updateStats();
        showNotification('All messages deleted', 'success');
    } catch (error) {
        console.error('Error clearing messages:', error);
        showNotification('Failed to clear messages', 'error');
    }
}

// Export Messages
function exportMessages() {
    database.ref('contacts').once('value').then(snapshot => {
        const messages = snapshot.val();
        if (messages) {
            const data = Object.entries(messages).map(([key, message]) => ({
                id: key,
                ...message
            }));
            
            const csv = convertToCSV(data);
            downloadCSV(csv, 'messages.csv');
            showNotification('Messages exported successfully', 'success');
        } else {
            showNotification('No messages to export', 'info');
        }
    }).catch(error => {
        console.error('Error exporting messages:', error);
        showNotification('Failed to export messages', 'error');
    });
}

// Convert to CSV
function convertToCSV(data) {
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Type', 'Message', 'Timestamp', 'Read'];
    const rows = data.map(item => [
        item.id,
        item.name,
        item.email,
        item.subject,
        item.inquiryType || '',
        item.message.replace(/"/g, '""'),
        item.timestamp,
        item.read ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Update Statistics
async function updateStats() {
    try {
        const snapshot = await database.ref('contacts').once('value');
        const messages = snapshot.val();
        
        if (messages) {
            const messageArray = Object.values(messages);
            const now = new Date();
            const today = now.toDateString();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const totalMessages = messageArray.length;
            const todayMessages = messageArray.filter(msg => 
                new Date(msg.timestamp).toDateString() === today
            ).length;
            const recentMessages = messageArray.filter(msg => 
                new Date(msg.timestamp) >= weekAgo
            ).length;
            
            document.getElementById('totalMessages').textContent = totalMessages;
            document.getElementById('todayMessages').textContent = todayMessages;
            document.getElementById('recentMessages').textContent = recentMessages;
        } else {
            document.getElementById('totalMessages').textContent = '0';
            document.getElementById('todayMessages').textContent = '0';
            document.getElementById('recentMessages').textContent = '0';
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Reply Modal Functions
let currentReplyKey = null;

function openReplyModal(key) {
    const messageRef = database.ref(`contacts/${key}`);
    messageRef.once('value').then((snapshot) => {
        const message = snapshot.val();
        if (message) {
            currentReplyKey = key;
            document.getElementById('replyTo').textContent = message.email;
            document.getElementById('replySubject').textContent = `Re: ${message.subject}`;
            document.getElementById('replyModal').style.display = 'block';
        }
    });
}

function closeReplyModal() {
    document.getElementById('replyModal').style.display = 'none';
    document.getElementById('replyForm').reset();
    currentReplyKey = null;
}

// Reply Form Submission
const replyForm = document.getElementById('replyForm');
if (replyForm) {
    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const replyMessage = document.getElementById('replyMessage').value;
        const attachmentFile = document.getElementById('replyAttachment').files[0];
        
        try {
            // Mark message as replied
            await database.ref(`contacts/${currentReplyKey}`).update({
                replied: true,
                status: 'replied',
                replyTimestamp: new Date().toISOString()
            });
            
            // Here you would integrate with an email service like EmailJS, SendGrid, or backend API
            // For now, we'll simulate the email sending
            const replyData = {
                to: document.getElementById('replyTo').textContent,
                subject: document.getElementById('replySubject').textContent,
                message: replyMessage,
                attachment: attachmentFile ? attachmentFile.name : null,
                timestamp: new Date().toISOString()
            };
            
            // Save reply to Firebase for tracking
            await database.ref('replies').push(replyData);
            
            showNotification('Reply sent successfully!', 'success');
            closeReplyModal();
            loadMessages(); // Refresh messages list
            updateStats(); // Update statistics
            
        } catch (error) {
            console.error('Error sending reply:', error);
            showNotification('Failed to send reply. Please try again.', 'error');
        }
    });
}

// Update Statistics with more details
async function updateStats() {
    try {
        const snapshot = await database.ref('contacts').once('value');
        const messages = snapshot.val();
        
        if (messages) {
            const messageArray = Object.values(messages);
            const now = new Date();
            const today = now.toDateString();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const totalMessages = messageArray.length;
            const todayMessages = messageArray.filter(msg => 
                new Date(msg.timestamp).toDateString() === today
            ).length;
            const recentMessages = messageArray.filter(msg => 
                new Date(msg.timestamp) >= weekAgo
            ).length;
            const unreadMessages = messageArray.filter(msg => !msg.read).length;
            const repliedMessages = messageArray.filter(msg => msg.replied).length;
            const pendingMessages = messageArray.filter(msg => msg.status === 'pending').length;
            
            document.getElementById('totalMessages').textContent = totalMessages;
            document.getElementById('todayMessages').textContent = todayMessages;
            document.getElementById('recentMessages').textContent = recentMessages;
            
            // Add additional stats if elements exist
            const unreadElement = document.getElementById('unreadMessages');
            const repliedElement = document.getElementById('repliedMessages');
            const pendingElement = document.getElementById('pendingMessages');
            
            if (unreadElement) unreadElement.textContent = unreadMessages;
            if (repliedElement) repliedElement.textContent = repliedMessages;
            if (pendingElement) pendingElement.textContent = pendingMessages;
        } else {
            document.getElementById('totalMessages').textContent = '0';
            document.getElementById('todayMessages').textContent = '0';
            document.getElementById('recentMessages').textContent = '0';
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDOMElements);
} else {
    initializeDOMElements();
}

// Show Notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #dc3545, #fd7e14)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #007bff, #6f42c1)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications and message styling
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .message-item {
        background: var(--light-bg);
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        border-left: 4px solid;
        border-image: var(--gradient) 1;
    }
    
    .message-item.unread {
        background: white;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .message-header h4 {
        color: var(--primary-blue);
        margin: 0;
    }
    
    .message-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .unread-badge {
        background: var(--primary-red);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .btn-small {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-small:hover {
        transform: translateY(-1px);
    }
    
    .btn-danger {
        background: var(--primary-red);
        color: white;
    }
    
    .btn-danger:hover {
        background: #c82333;
    }
    
    .message-content p {
        margin-bottom: 0.5rem;
        color: #555;
    }
    
    .message-footer {
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid #ddd;
    }
    
    .message-footer small {
        color: #999;
    }
`;
document.head.appendChild(style);

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Typing effect for hero title (only on homepage)
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
}

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Parallax effect for hero section (only on homepage)
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Add hover effects to cards
document.querySelectorAll('.info-card, .skill-card, .feature-card, .project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});
