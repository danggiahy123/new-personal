@echo off
echo Starting VMware ESXi Management System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd vmware-backend && node start-server.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd vmware-webadmin && npm start"

echo.
echo Services starting...
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3001
echo.
echo Please wait for frontend to compile...
echo Then open http://localhost:3001 in your browser
echo.
pause
