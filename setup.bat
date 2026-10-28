@echo off
echo ==== GreenCart setup ====
if not exist server\.env copy server\.env.example server\.env
if not exist client\.env copy client\.env.example client\.env
echo.
echo Installing server packages...
cd server
call npm install
cd ..
echo.
echo Installing client packages...
cd client
call npm install
cd ..
echo.
echo ==== DONE ====
echo Now open server\.env in Notepad and fill in:
echo   MONGODB_URI, JWT_SECRET, SELLER_EMAIL, SELLER_PASSWORD, CLOUDINARY_* keys
echo Then double-click start.bat
pause
