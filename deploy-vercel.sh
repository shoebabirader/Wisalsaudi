#!/bin/bash

# WISAL E-Commerce Platform - Vercel Deployment Script
# This script helps deploy the frontend to Vercel

echo "🚀 Deploying WISAL E-Commerce Platform to Vercel..."
echo ""
echo "📋 Important: Make sure you have configured your Vercel project with:"
echo "   - Root Directory: apps/frontend"
echo "   - Framework: Next.js"
echo "   - Install Command: npm install --legacy-peer-deps"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Install it with: npm install -g vercel"
    exit 1
fi

# Navigate to frontend directory
cd apps/frontend

echo "🔨 Building the project..."
npm install --legacy-peer-deps
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
