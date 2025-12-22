@echo off
echo ========================================
echo Port Cleanup Utility
echo ========================================
echo.
echo Killing all processes on ports 3000, 3001, 3002, 8000...
echo.

REM Kill Node.js processes
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Killing process on port 3001 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do (
    echo Killing process on port 3002 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Kill Python/FastAPI processes
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing process on port 8000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================
echo Ports cleaned successfully!
echo ========================================
pause
