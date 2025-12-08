@echo off
echo ==========================================
echo MeshCards Setup & Test Script
echo ==========================================

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo ==========================================
echo Running CLI Test (Gemini)
echo ==========================================
if not exist .env (
    echo [WARNING] .env file not found! Please create it with your API keys.
    pause
    exit /b 1
)

venv\Scripts\python -m src.cli.main sample.txt --output test_deck_bat.apkg --provider gemini

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Deck generated successfully: test_deck_bat.apkg
) else (
    echo.
    echo [FAILURE] CLI Test failed.
)

echo.
echo ==========================================
echo To run the API server, use:
echo venv\Scripts\uvicorn src.api.server:app --reload
echo ==========================================

pause
