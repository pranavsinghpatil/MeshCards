@echo off
setlocal

echo ==========================================
echo       MeshCards Launcher
echo ==========================================

REM Check if venv exists
if not exist "venv" (
    echo Virtual environment not found. Running setup...
    call setup_and_test.bat
)

REM Activate venv
call venv\Scripts\activate

REM Install dependencies to be safe (fast if already installed)
echo Checking dependencies...
pip install -r requirements.txt > nul 2>&1

echo.
echo Starting MeshCards Server...
echo Opening http://localhost:8000 in your browser...

REM Open browser
start http://localhost:8000

REM Start Server
python -m uvicorn src.api.server:app --reload --port 8000

endlocal
