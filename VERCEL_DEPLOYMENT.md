# Vercel Deployment Guide for WISAL E-Commerce Platform

This is a monorepo project. The frontend Next.js app is located in `apps/frontend`.

## Vercel Dashboard Configuration

To deploy this project correctly on Vercel:

1. **Go to Project Settings** → General
2. **Set Root Directory**: `apps/frontend`
3. **Framework Preset**: Next.js
4. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install --legacy-peer-deps`

5. **Redeploy** the project

## Why the 404 Error Occurs

The 404 error happens because Vercel doesn't know where the Next.js app is in the monorepo structure. By setting the Root Directory to `apps/frontend`, Vercel will:
- Look for `package.json` in `apps/frontend`
- Run the build command in that directory
- Serve the Next.js app correctly

## Alternative: Deploy Only Frontend

If you want to deploy only the frontend separately:

1. Create a new Vercel project
2. Connect it to the same GitHub repo
3. Set Root Directory to `apps/frontend`
4. Deploy

The backend can be deployed separately to a different service (Railway, Render, etc.)
