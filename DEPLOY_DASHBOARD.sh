#!/bin/bash

# Dashboard Deployment Script
# Deploy to dashboard.respirashield.com

echo "🚀 Starting Dashboard Deployment..."

# Navigate to dashboard directory
cd vape-insurance-dashboard

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "Dashboard should be live at: https://dashboard.respirashield.com"
