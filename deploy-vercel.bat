@echo off
REM WISAL E-Commerce Platform - Vercel Deployment Script (Windows)

echo.
echo ========================================
echo WISAL E-Commerce Platform Deployment
echo ========================================
echo.
echo Important: Configure your Vercel project with:
echo   - Root Directory: apps/frontend
echo   - Framework: Next.js  
echo   - Install Command: npm install --legacy-peer-deps
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Vercel CLI is not installed.
    echo Install it with: npm install -g vercel
    exit /b 1
)

REM Navigate to frontend directory
cd apps\frontend

echo Building the project...
call npm install --legacy-peer-deps
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build successful!
    echo.
    echo Deploying to Vercel...
    call vercel --prod
) else (
    echo.
    echo Build failed. Please fix the errors and try again.
    exit /b 1
)
