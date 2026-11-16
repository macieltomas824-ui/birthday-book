@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\deploy-vercel.ps1" %*
if errorlevel 1 (
  echo.
  echo Hubo un error. Revisa el mensaje anterior.
  pause
  exit /b 1
)
echo.
pause
