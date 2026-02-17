# Ampfrey Tukwasibwe - Portfolio Website

A professional portfolio website showcasing Ampfrey Tukwasibwe's skills, achievements, and ventures. Built with HTML, CSS, and JavaScript, integrated with Firebase for the contact form and admin panel.

## Features

### 🎨 Design Elements
- **Color Scheme**: Green, Blue, Red, and Orange as requested
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Clean, professional, and engaging interface
- **Smooth Animations**: Parallax effects, typing animations, and scroll animations

### 📱 Sections
1. **Hero Section**: Eye-catching introduction with call-to-action buttons
2. **About Section**: Personal background and leadership achievements
3. **Skills Section**: Web Development, Mobile Apps, Graphic Design, OBS Streaming
4. **StrateTV Section**: Founder showcase for StrateTV/StrateMedia
5. **Contact Form**: Functional form with Firebase integration
6. **Admin Panel**: Secure admin access to view and manage contact messages

### 🔧 Technical Features
- **Firebase Integration**: Real-time database for contact messages
- **Admin Authentication**: Secure login (Username: ampfrey, Password: ampfrey123)
- **Form Validation**: Client-side validation for better user experience
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Loading States**: Visual feedback during form submission
- **Notifications**: User-friendly success/error messages

## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "ampfrey-portfolio"
3. Enable Realtime Database
4. Copy your Firebase configuration
5. Replace the placeholder config in `script.js` with your actual config

### 2. Update Firebase Configuration
In `script.js`, replace the placeholder configuration:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Deploy the Website
You can deploy this website using:
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Easy deployment with continuous integration
- **Vercel**: Modern deployment platform
- **Firebase Hosting**: Integrated with your Firebase project

## Admin Panel Access

- **URL**: Navigate to the Admin section on the website
- **Username**: `ampfrey`
- **Password**: `ampfrey123`

### Admin Features:
- View all contact messages
- Delete messages
- Real-time updates
- Secure logout

## File Structure

```
ampfrey-portfolio/
├── index.html          # Main HTML file
├── styles.css          # Complete styling with color scheme
├── script.js           # JavaScript functionality and Firebase integration
└── README.md          # This documentation file
```

## Customization

### Colors
The color scheme is defined in CSS variables:
```css
:root {
    --primary-green: #28a745;
    --primary-blue: #007bff;
    --primary-red: #dc3545;
    --primary-orange: #fd7e14;
}
```

### Content
Update the content directly in `index.html`:
- Personal information
- Skills and technologies
- Project descriptions
- Contact details

### Images
Replace the placeholder icons with actual photos:
- Profile picture in hero section
- StrateTV logo/image
- Project screenshots

## Browser Support

- Chrome (Recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance Features

- **Optimized Animations**: CSS transforms for smooth 60fps animations
- **Lazy Loading**: Intersection Observer for scroll animations
- **Responsive Images**: Proper image sizing for different devices
- **Minified Code**: Production-ready optimized code

## Security Features

- **Firebase Security Rules**: Implement proper database rules
- **Input Validation**: Client-side form validation
- **XSS Protection**: Safe HTML rendering
- **HTTPS Ready**: Secure deployment recommended

## Support

For any issues or questions:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure all files are in the same directory
4. Test on different browsers

## Future Enhancements

- Blog section for technical articles
- Project portfolio with detailed case studies
- Resume download feature
- Social media integration
- Analytics integration
- SEO optimization
- Dark mode toggle

---

**Built with ❤️ for Ampfrey Tukwasibwe**
