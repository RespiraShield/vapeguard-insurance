# VapeGuard Insurance Portal - Production Deployment Guide

## 🎯 Deployment Strategy

- **Frontend**: Vercel (Free tier, automatic deployments)
- **Backend**: Railway (Free tier, $5 credit/month)
- **Database**: MongoDB Atlas (Already configured)
- **Email**: Resend (Already configured)

---

## 📦 Step 1: Prepare GitHub Repository

### 1.1 Initialize Git Repository

```bash
cd /Users/govardhandamam/Desktop/Development/vape-guard-app

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - VapeGuard Insurance Portal"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `vape-guard-insurance`
3. Description: `VapeGuard Insurance Portal - Health insurance for vape users`
4. **Private** repository (recommended)
5. **Don't** initialize with README (we already have code)
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/vape-guard-insurance.git

# Push code
git branch -M main
git push -u origin main
```

---

## 🖥️ Step 2: Deploy Backend to Railway

### 2.1 Sign Up for Railway

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway to access your repositories

### 2.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `vape-guard-insurance` repository
4. Railway will detect it's a Node.js project

### 2.3 Configure Backend Service

1. Click on the deployed service
2. Go to "Settings"
3. **Root Directory**: Set to `vape-insurance-backend`
4. **Start Command**: `npm start`
5. **Build Command**: `npm install`

### 2.4 Add Environment Variables

Go to "Variables" tab and add these:

```env
NODE_ENV=production
PORT=5000

# Database (your existing MongoDB Atlas)
MONGODB_URI=mongodb+srv://respira_shield_user:vapeinsurance%401998@respira-shield-cluster.jgajjh0.mongodb.net/respira-shield?retryWrites=true&w=majority&appName=respira-shield-cluster

# JWT
JWT_SECRET=respirashield_super_secret_jwt_key_2024_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=re_cJCySTme_JwU4YRMifN3H8v3w7wvauDjS
RESEND_FROM_EMAIL=no-reply@respirashield.com
FROM_NAME=RespiraShield Insurance

# Razorpay (if you have keys)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS (will update after frontend deployment)
FRONTEND_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
PAYMENT_ENABLED=false
BILL_PHOTO_ENABLED=false
```

### 2.5 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Railway will provide a URL like: `https://vape-guard-backend.up.railway.app`
4. **Copy this URL** - you'll need it for frontend

### 2.6 Test Backend

```bash
# Test health endpoint
curl https://vape-guard-backend.up.railway.app/health

# Should return:
# {"status":"OK","message":"VapeGuard Insurance API is running",...}
```

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Sign Up for Vercel

1. Go to https://vercel.com/
2. Click "Sign Up"
3. Sign in with GitHub
4. Authorize Vercel

### 3.2 Import Project

1. Click "Add New..." → "Project"
2. Import `vape-guard-insurance` repository
3. Vercel will detect it's a React app

### 3.3 Configure Frontend

**Framework Preset**: Create React App
**Root Directory**: `vape-insurance-portal`
**Build Command**: `npm run build`
**Output Directory**: `build`

### 3.4 Add Environment Variables

Click "Environment Variables" and add:

```env
REACT_APP_API_URL=https://vape-guard-backend.up.railway.app/api
REACT_APP_ENV=production
```

**Important**: Replace `vape-guard-backend.up.railway.app` with your actual Railway URL from Step 2.5

### 3.5 Deploy

1. Click "Deploy"
2. Wait for build (3-5 minutes)
3. Vercel will provide a URL like: `https://vape-guard-insurance.vercel.app`

---

## 🔄 Step 4: Update Backend CORS

Now that you have the frontend URL, update Railway backend:

1. Go to Railway dashboard
2. Select your backend service
3. Go to "Variables"
4. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://vape-guard-insurance.vercel.app
   ```
5. Service will auto-redeploy

---

## ✅ Step 5: Test Production Deployment

### 5.1 Test Backend

```bash
# Health check
curl https://vape-guard-backend.up.railway.app/health

# Insurance plans
curl https://vape-guard-backend.up.railway.app/api/insurance/plans

# Send OTP (use your real email)
curl -X POST https://vape-guard-backend.up.railway.app/api/otp/email/send \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","name":"Test"}'
```

### 5.2 Test Frontend

1. Open `https://vape-guard-insurance.vercel.app` in browser
2. Enter your details
3. Click "Send OTP"
4. Check your email
5. Enter OTP and verify
6. Complete the application flow

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: 500 errors
**Fix**: Check Railway logs → "View Logs" tab

**Problem**: CORS errors
**Fix**: Verify `FRONTEND_URL` matches your Vercel URL exactly

**Problem**: Database connection failed
**Fix**: Check `MONGODB_URI` is correct in Railway variables

### Frontend Issues

**Problem**: API calls failing
**Fix**: Verify `REACT_APP_API_URL` points to Railway backend URL

**Problem**: Build failed
**Fix**: Check Vercel build logs, ensure all dependencies in package.json

### Email Issues

**Problem**: Emails not sending
**Fix**: 
1. Check Resend dashboard: https://resend.com/emails
2. Verify domain is active
3. Check Railway logs for email errors

---

## 📊 Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Can send OTP email
- [ ] Can verify OTP
- [ ] Can create application
- [ ] Can select insurance
- [ ] Can enroll application
- [ ] MongoDB data persists correctly

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| Vercel | Unlimited | $20/month (Pro) |
| Railway | $5 credit/month | $0.000231/min |
| MongoDB Atlas | 512MB storage | $9/month (M2) |
| Resend | 3,000 emails/month | $20/month (Pro) |

**Total Free Tier**: Perfect for MVP and initial users!

---

## 🚀 Ready to Deploy?

Follow the steps above in order. I'll help you with each step!

**Start with Step 1** - Let me know when you're ready to initialize the git repository.
