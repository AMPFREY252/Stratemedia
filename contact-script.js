// Contact Form Script - Works with Clean Admin System

document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact form loaded, initializing...');
    
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
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
                
                // Update status
                updateFormStatus('Sending your message...', 'info');
                
                // Save to Firebase using correct v9+ syntax
                if (window.database) {
                    const { ref, push } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js");
                    await push(ref(window.database, 'contacts'), formData);
                    
                    // Success
                    updateFormStatus('Message sent successfully! I will get back to you soon.', 'success');
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Show success notification
                    showNotification('Message sent successfully! I will get back to you soon.', 'success');
                    
                } else {
                    throw new Error('Firebase database not available');
                }
                
            } catch (error) {
                console.error('Error sending message:', error);
                updateFormStatus('Failed to send message. Please try again.', 'error');
                showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Clear status after 5 seconds
                setTimeout(() => {
                    updateFormStatus('', '');
                }, 5000);
            }
        });
    }
    
    // Update form status
    function updateFormStatus(message, type) {
        if (formStatus) {
            formStatus.innerHTML = `
                <div class="status-message ${type}">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    ${message}
                </div>
            `;
            
            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    formStatus.innerHTML = '';
                }, 5000);
            }
        }
    }
    
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
    
    console.log('Contact form initialized successfully!');
});
