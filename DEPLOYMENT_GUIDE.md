# VapeGuard Insurance Portal - Deployment Guide

Complete guide to deploy frontend and backend to production.

---

## 📋 Prerequisites

- GitHub account
- Domain name (e.g., respirashield.com)
- MongoDB Atlas database (already configured)
- Resend email account (already configured)

---

## 🚀 Part 1: Push Code to GitHub

### Step 1: Initialize Git Repository

```bash
cd /path/to/vape-guard-app

git init
git add vape-insurance-backend/ vape-insurance-portal/ .gitignore README.md
git commit -m "Initial commit - VapeGuard Insurance Portal"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `vapeguard-insurance`
3. Set as **Private**
4. Click **"Create repository"**

### Step 3: Push to GitHub

```bash
# Add remote (replace YOUR_ORG with your GitHub username/org)
git remote add origin https://github.com/YOUR_ORG/vapeguard-insurance.git

# Push code
git branch -M main
git push -u origin main
```

**Note**: You'll need a GitHub Personal Access Token. Generate at: https://github.com/settings/tokens

---

## 🖥️ Part 2: Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to https://render.com/
2. Click **"Get Started"**
3. Sign in with **GitHub**
4. Authorize Render

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Find and click **"Connect"** next to your repository
3. Configure:
   - **Name**: `vapeguard-backend`
   - **Region**: Select closest to you
   - **Branch**: `main`
   - **Root Directory**: `vape-insurance-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

### Step 3: Add Environment Variables

Add these variables in Render:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=no-reply@yourdomain.com
FROM_NAME=Your Company Name
FRONTEND_URL=https://app.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
PAYMENT_ENABLED=false
BILL_PHOTO_ENABLED=false
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Copy your backend URL (e.g., `https://vapeguard-backend.onrender.com`)

### Step 5: Add Custom Domain (Optional)

1. In Render service → **Settings** → **Custom Domain**
2. Add: `api.yourdomain.com`
3. Add CNAME record in your DNS:
   - **Type**: CNAME
   - **Name**: `api`
   - **Points to**: `vapeguard-backend.onrender.com`
4. Wait 10-30 minutes for DNS propagation
5. Click **"Verify"** in Render

---

## 🌐 Part 3: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com/
2. Click **"Sign Up"**
3. Sign in with **GitHub**
4. Authorize Vercel

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository and click **"Import"**
3. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `vape-insurance-portal`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Add Environment Variables

Add these in Vercel:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_ENV=production
REACT_APP_PAYMENT_ENABLED=false
REACT_APP_BILL_PHOTO_ENABLED=false
```

**Important**: Use your actual backend URL from Part 2, Step 4

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait 3-5 minutes
3. Copy your frontend URL (e.g., `https://vapeguard-insurance.vercel.app`)

### Step 5: Add Custom Domain

1. In Vercel project → **Settings** → **Domains**
2. Add: `app.yourdomain.com`
3. Add CNAME record in your DNS:
   - **Type**: CNAME
   - **Name**: `app`
   - **Points to**: `cname.vercel-dns.com`
4. Wait 10-30 minutes for DNS propagation
5. Vercel will auto-verify and issue SSL

---

## 🔄 Part 4: Update CORS Configuration

### Update Backend Environment Variable

1. Go to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your custom domain:
   ```
   FRONTEND_URL=https://app.yourdomain.com
   ```
4. Save (auto-redeploys in ~1 minute)

### Update Frontend Environment Variable (if using custom backend domain)

1. Go to Vercel dashboard → Your project
2. Go to **Settings** → **Environment Variables**
3. Update `REACT_APP_API_URL`:
   ```
   REACT_APP_API_URL=https://api.yourdomain.com/api
   ```
4. Redeploy: **Deployments** → **"..."** → **Redeploy**

---

## ✅ Part 5: Verify Deployment

### Test Backend

```bash
# Health check
curl https://api.yourdomain.com/health

# Insurance plans
curl https://api.yourdomain.com/api/insurance/plans
```

### Test Frontend

1. Open `https://app.yourdomain.com`
2. Complete the flow:
   - Enter email → Send OTP
   - Check email inbox
   - Enter OTP → Verify
   - Fill personal details → Next
   - Select insurance plan → Next
   - Enroll application → Success!

---

## 📊 DNS Configuration Summary

Add these records in your domain DNS (e.g., Hostinger, Cloudflare):

| Type | Name | Points to | Purpose |
|------|------|-----------|---------|
| **CNAME** | `app` | `cname.vercel-dns.com` | Frontend (Vercel) |
| **CNAME** | `api` | `vapeguard-backend.onrender.com` | Backend (Render) |

---

## 🎯 Final URLs

After deployment:

- **Frontend**: https://app.yourdomain.com
- **Backend**: https://api.yourdomain.com
- **Backend API**: https://api.yourdomain.com/api
- **Health Check**: https://api.yourdomain.com/health

---

## 💰 Cost Breakdown

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Render** | 750 hours/month | Backend sleeps after 15 min inactivity |
| **Vercel** | Unlimited | Frontend always-on |
| **MongoDB Atlas** | 512MB storage | Already configured |
| **Resend** | 3,000 emails/month | Already configured |

**Total Monthly Cost**: $0 (Free tier)

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: 500 errors
- **Fix**: Check Render logs (Logs tab)

**Problem**: CORS errors
- **Fix**: Verify `FRONTEND_URL` matches your Vercel URL exactly

**Problem**: Database connection failed
- **Fix**: Check `MONGODB_URI` in Render environment variables

### Frontend Issues

**Problem**: API calls failing
- **Fix**: Verify `REACT_APP_API_URL` points to correct backend URL

**Problem**: Build failed
- **Fix**: Check Vercel build logs, ensure all dependencies in package.json

**Problem**: Domain shows Hostinger page
- **Fix**: Verify CNAME record points to `cname.vercel-dns.com`

### DNS Issues

**Problem**: Domain not working
- **Fix**: Wait 10-30 minutes for DNS propagation
- **Check**: Run `nslookup app.yourdomain.com`

---

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Backend environment variables added
- [ ] Backend custom domain configured (optional)
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables added
- [ ] Frontend custom domain configured
- [ ] Backend CORS updated with frontend URL
- [ ] DNS records added and verified
- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] OTP email sending works
- [ ] Complete application flow tested

---

## 📝 Notes

- **Free tier limitations**: Backend sleeps after 15 minutes of inactivity (wakes in ~30 seconds)
- **SSL certificates**: Automatically issued and renewed by Render and Vercel
- **Auto-deployments**: Both platforms auto-deploy on git push to main branch
- **Environment variables**: Changes require manual redeploy

---

## 🆘 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Resend Docs**: https://resend.com/docs

---

**Deployment complete! Your VapeGuard Insurance Portal is now live!** 🎉
