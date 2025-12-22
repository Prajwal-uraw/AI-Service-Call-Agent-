@echo off
echo ========================================
echo Kestrel AI - Server Startup Script
echo ========================================
echo.

echo [1/4] Cleaning up ports...
echo Killing processes on port 3000, 3001, 3002, 8000...

REM Kill Node.js processes on ports 3000-3002
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /F /PID %%a 2>nul

REM Kill Python processes on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a 2>nul

timeout /t 2 /nobreak >nul
echo Ports cleaned!
echo.

echo [2/4] Starting Backend Server (FastAPI on port 8000)...
cd demand-engine
start "Kestrel Backend" cmd /k "python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000"
cd ..
timeout /t 3 /nobreak >nul
echo Backend starting...
echo.

echo [3/4] Starting Frontend Server (Next.js on port 3000)...
cd frontend
start "Kestrel Frontend" cmd /k "npm run dev"
cd ..
timeout /t 3 /nobreak >nul
echo Frontend starting...
echo.

echo [4/4] Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.

echo ========================================
echo Servers Started Successfully!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WindowTitle eq Kestrel Backend*" /F 2>nul
taskkill /FI "WindowTitle eq Kestrel Frontend*" /F 2>nul
echo Servers stopped.
pause
