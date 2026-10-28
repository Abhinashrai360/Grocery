@echo off
start "GreenCart API" cmd /k "cd /d %~dp0server && npm run server"
start "GreenCart Website" cmd /k "cd /d %~dp0client && npm run dev"
echo API:      http://localhost:5000
echo Website:  http://localhost:5173
timeout /t 5 >nul
start http://localhost:5173
