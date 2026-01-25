@echo off
setlocal EnableDelayedExpansion

title MeshCards Studio

echo ===================================================
echo             MeshCards Studio Launcher
echo ===================================================

:: 1. Setup Python Env
if not exist "venv" (
    echo [INFO] Creating Python venv...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt >nul 2>&1

:: 2. Check Frontend Build
if not exist "frontend\dist" (
    echo [INFO] Frontend build not found. Building React app...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

:: 3. Launch
echo.
echo [INFO] Starting Server...
echo [INFO] Browser will open in 5 seconds...

:: Launch Browser in background after delay
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:8000"

:: Start Uvicorn
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

