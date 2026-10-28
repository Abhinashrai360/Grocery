@echo off
cd /d %~dp0server
echo ---- 1) What is stored in your database (read only) ----
node scripts/check-images.js
echo.
echo ---- 2) Upload sample images to Cloudinary and repair products ----
pause
node scripts/seed-products.js
pause
