# 🎨 Frontend Guide - VapeGuard Insurance Portal

> **For the Visual People!** This is the part users see and interact with 👀

## 🌟 What is the Frontend?

Think of the frontend like the **face of a restaurant**:
- It's what customers see and interact with
- It looks pretty and is easy to use
- It takes orders (user input) and shows results
- Behind the scenes, it talks to the kitchen (backend)

## 📱 Our Frontend Structure

```
src/
├── 🏠 Components/           # Building blocks of our app
│   ├── MainPage.jsx        # The main controller (like a conductor)
│   ├── PersonalDetailsStep.jsx    # Step 1: Get user info
│   ├── InsuranceSelectionStep.jsx # Step 2: Choose plan
│   ├── PaymentStep.jsx     # Step 3: Payment details
│   ├── SuccessStep.jsx     # Step 4: Celebration! 🎉
│   └── styles.css          # Makes everything look pretty
│
├── 📡 services/
│   └── api.js              # Talks to the backend
│
└── 📄 index.js             # Starting point of the app
```

## 🎭 Components Explained (Like LEGO Blocks!)

### 🎯 MainPage.jsx - The Boss Component
**What it does**: Controls the entire 4-step process
```javascript
// Like a traffic controller
const [currentStep, setCurrentStep] = useState(1); // Which step are we on?
const [formData, setFormData] = useState({...});   // What data do we have?
```

**Key Features**:
- 🔄 Moves between steps (1 → 2 → 3 → 4)
- 💾 Saves data at each step
- ✅ Validates everything is correct
- 🌐 Talks to backend to save data

### 👤 PersonalDetailsStep.jsx - Getting to Know You
**What it does**: Collects basic user information
```javascript
// Simple form fields
<input name="name" placeholder="Enter your full name" />
<input name="dob" type="date" />
<select name="city">...</select>
<input type="file" accept="image/*" /> // For bill photo
```

**Validation Rules**:
- ✅ Name: At least 2 characters, only letters
- ✅ Age: Must be 18+ years old
- ✅ City: Must select from dropdown
- ✅ Photo: Only images, max 10MB

### 🛡️ InsuranceSelectionStep.jsx - Choose Your Shield
**What it does**: Shows 3 insurance plans as cards
```javascript
// Creates clickable cards
{insurancePlans.map(plan => (
  <div className="insurance-card" onClick={() => selectPlan(plan.id)}>
    <h3>{plan.name}</h3>
    <p>{plan.price}</p>
    <ul>{plan.features.map(feature => <li>{feature}</li>)}</ul>
  </div>
))}
```

### 💳 PaymentStep.jsx - Show Me the Money
**What it does**: Handles different payment methods
```javascript
// Different forms based on payment method
if (paymentMethod === 'upi') {
  return <input placeholder="yourname@paytm" />
}
if (paymentMethod === 'netbanking') {
  return <select>banks...</select>
}
if (paymentMethod === 'card') {
  return <div>card number, expiry, cvv...</div>
}
```

### 🎉 SuccessStep.jsx - Victory Dance
**What it does**: Shows success message with application number
```javascript
<div className="success-message">
  <span>🎉</span>
  <h2>Congratulations!</h2>
  <p>Application Number: {applicationNumber}</p>
</div>
```

## 📡 API Service - The Messenger

**What it does**: Like a postal service between frontend and backend

```javascript
// Sends personal details to backend
await apiService.submitPersonalDetails({
  name: "John Doe",
  dob: "1990-01-01",
  city: "mumbai"
});

// Uploads file to backend
await apiService.uploadBillPhoto(applicationId, file);

// Processes payment
await apiService.processPayment(applicationId, paymentData);
```

## 🎨 Styling (Making it Pretty!)

### CSS Classes We Use:
- `.container` - Main wrapper
- `.form-container` - Form styling
- `.button.primary` - Main action buttons
- `.insurance-card` - Plan selection cards
- `.success-message` - Celebration styling

### Color Scheme:
- 🔵 Primary Blue: For main buttons
- 🟢 Success Green: For completed steps
- 🔴 Error Red: For validation errors
- ⚪ Clean White: Background

## 🔄 Data Flow (How Information Moves)

```
1. User types in form → formData state updates
2. User clicks "Next" → Validation runs
3. If valid → Send to backend via API
4. Backend responds → Update UI accordingly
5. Move to next step → Repeat!
```

## 🧪 Testing the Frontend

### Manual Testing Checklist:
- [ ] Can fill out personal details
- [ ] Can upload a photo
- [ ] Can select insurance plan
- [ ] Can enter payment details
- [ ] See success message with app number

### Common Test Scenarios:
```javascript
// Test invalid name
name: "J" // Should show error: "Name too short"

// Test underage
dob: "2010-01-01" // Should show error: "Must be 18+"

// Test large file
file: 15MB_image.jpg // Should show error: "File too large"
```

## 🔧 Environment Setup

### Required Files:
```bash
.env                    # API configuration
├── REACT_APP_API_URL=http://localhost:5000/api
```

### Development Commands:
```bash
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
```

## 🐛 Common Issues & Quick Fixes

### Issue: "Cannot connect to backend"
**Solution**: 
1. Check if backend is running on port 5000
2. Verify API_URL in .env file

### Issue: "File upload not working"
**Solution**:
1. Check file size (max 10MB)
2. Ensure it's an image file
3. Check backend upload endpoint

### Issue: "Form validation errors"
**Solution**:
1. Check validation rules in validators/
2. Ensure all required fields are filled
3. Verify data format (dates, emails, etc.)

## 🎯 For New Developers

### Start Here:
1. **Look at MainPage.jsx** - Understand the flow
2. **Check one step component** - See how forms work
3. **Look at api.js** - Understand backend communication
4. **Make a small change** - Change a button text
5. **Test it** - See your change in the browser!

### Easy First Tasks:
- 🎨 Change button colors in CSS
- 📝 Add a new validation message
- 🔄 Add a loading spinner
- 📱 Make it mobile-friendly

## 📚 Learning Path

1. **HTML/CSS Basics** → How web pages look
2. **JavaScript Fundamentals** → How to make things interactive
3. **React Basics** → How components work
4. **State Management** → How data flows
5. **API Integration** → How frontend talks to backend

## 🎉 Fun Facts

- 🚀 The entire form is just **one page** that changes content
- 🔄 Data is saved at **each step** so users don't lose progress
- 🎨 We use **CSS Grid** and **Flexbox** for layouts
- 📱 It works on **mobile phones** too!
- 🧪 We have **tests** to make sure it doesn't break

---

*Remember: Frontend is all about making users happy! If it's easy to use and looks good, you're doing it right! 😊*
