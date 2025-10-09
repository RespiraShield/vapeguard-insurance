# 🛡️ VapeGuard Insurance Dashboard

A secure, user-friendly dashboard for VapeGuard insurance policyholders to manage their accounts, view policy details, track payments, and access important documents.

## ✨ Features

- **🔐 Secure OTP Login**: Email-based OTP authentication for existing users
- **📊 Insurance Dashboard**: View current plan details, coverage, and benefits
- **💳 Payment Tracking**: Monthly payment history with interactive charts
- **📋 Application Management**: Track application status and download policy documents
- **🔒 Privacy Protection**: Masked PII display with verification status indicators
- **📱 Responsive Design**: Optimized for desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- VapeGuard Insurance Backend running on port 5000

### Installation

1. **Clone and setup**
   ```bash
   cd vape-insurance-dashboard
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENV=development
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   
   Dashboard runs on: http://localhost:3001

## 🏗️ Architecture

### Authentication Flow
1. **Email Check**: Verify user account exists
2. **OTP Generation**: Send secure 6-digit code via email
3. **OTP Verification**: Validate code and issue JWT token
4. **Session Management**: Secure token-based authentication

### Dashboard Components
- **PlanDetails**: Current insurance plan information
- **PaymentChart**: Monthly payment visualization using Ant Design Charts
- **ApplicationInfo**: Application status and policy documents
- **PersonalInfo**: Masked PII with verification status

### Security Features
- JWT-based authentication with refresh tokens
- Rate-limited OTP requests (5 per 15 minutes)
- Secure cookie handling for refresh tokens
- PII masking for sensitive data display

## 🎨 Design System

### UI Framework
- **Ant Design 5.27.1**: Professional component library
- **Custom Theme**: VapeGuard brand colors (#667eea primary)
- **Typography**: System fonts for optimal readability

### Responsive Breakpoints
- **Desktop**: > 1024px (sidebar layout)
- **Tablet**: 768px - 1024px (stacked layout)
- **Mobile**: < 768px (vertical stack)

## 📡 API Integration

### Authentication Endpoints
```
POST /api/auth/check-user          # Check if user exists
POST /api/auth/send-login-otp      # Send OTP to email
POST /api/auth/verify-login-otp    # Verify OTP and login
GET  /api/auth/me                  # Get current user
POST /api/auth/refresh             # Refresh JWT token
POST /api/auth/logout              # Logout user
```

### Dashboard Endpoints
```
GET  /api/dashboard                # Complete dashboard data
GET  /api/dashboard/current-plan   # Current insurance plan
GET  /api/dashboard/applications   # User applications
GET  /api/dashboard/payments       # Payment history
GET  /api/dashboard/monthly-payments # Monthly aggregation
GET  /api/dashboard/verification-status # KYC status
GET  /api/dashboard/masked-pii     # Masked personal data
```

## 🧪 Development

### Code Quality
```bash
npm run lint              # ESLint check
npm run lint:fix          # Auto-fix linting issues
npm run format            # Prettier formatting
npm run format:check      # Check formatting
```

### Testing
```bash
npm test                  # Run tests
npm run test:coverage     # Coverage report
```

### Build
```bash
npm run build            # Production build
```

## 🔐 Security Considerations

### Authentication Security
- **OTP Expiry**: 5-minute expiration for login codes
- **Rate Limiting**: Prevents brute force attacks
- **JWT Tokens**: Short-lived access tokens (24h)
- **Refresh Tokens**: Secure HTTP-only cookies (7 days)

### Data Protection
- **PII Masking**: Sensitive data never displayed in full
- **Verification Status**: Clear indicators for document verification
- **Secure Storage**: No sensitive data in localStorage

### Network Security
- **HTTPS Only**: Production requires secure connections
- **CORS Configuration**: Restricted to authorized origins
- **CSP Headers**: Content Security Policy implementation

## 📱 User Experience

### Login Flow
1. Enter registered email address
2. Receive OTP via email (6-digit code)
3. Enter OTP to authenticate
4. Automatic redirect to dashboard

### Dashboard Navigation
- **Header**: User greeting, refresh, and logout
- **Main Content**: Plan details, payment chart, applications
- **Sidebar**: Personal information with verification status

### Error Handling
- **Network Errors**: Graceful fallbacks with retry options
- **Authentication Errors**: Clear messaging and re-authentication
- **Data Loading**: Skeleton screens and loading indicators

## 🚀 Deployment

### Environment Variables
```bash
REACT_APP_API_URL=https://api.vapeguard.com/api
REACT_APP_ENV=production
```

### Build Process
```bash
npm run build
# Deploy build/ directory to CDN or static hosting
```

### Performance Optimization
- **Code Splitting**: Lazy loading for dashboard components
- **Asset Optimization**: Compressed images and fonts
- **Caching Strategy**: Service worker for offline support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by VapeGuard Team
</div>
