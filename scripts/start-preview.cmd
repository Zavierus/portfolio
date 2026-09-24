@echo off
setlocal
cd /d "%~dp0.."
set "PYTHON=%LOCALAPPDATA%\hermes\hermes-agent\venv\Scripts\python.exe"
if not exist "%PYTHON%" set "PYTHON=python.exe"
start "ZIAVER Preview" /b "%PYTHON%" "%~dp0preview-server.py" 4266
endlocal
