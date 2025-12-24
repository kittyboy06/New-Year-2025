@echo off
echo ==========================================
echo      New Year 2025 - Auto Deployer
echo ==========================================
echo.
echo [1/2] Building and Deploying to GitHub Pages...
echo.

call npm run deploy

echo.
echo ==========================================
if %ERRORLEVEL% equ 0 (
    echo    SUCCESS! Application Deployed.
) else (
    echo    ERROR! Deployment Failed.
)
echo ==========================================
echo.
pause
