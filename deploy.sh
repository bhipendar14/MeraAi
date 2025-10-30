#!/bin/bash

# Quick Vercel Deployment Script

echo "🚀 Starting deployment to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Logging in to Vercel..."
vercel login

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at the URL shown above"
echo ""
echo "📋 Don't forget to:"
echo "   1. Add environment variables in Vercel dashboard"
echo "   2. Check MongoDB Atlas network access"
echo "   3. Test all features after deployment"