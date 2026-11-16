@echo off
setlocal
title Entre petalos - servidor local
cd /d "%~dp0"

echo.
echo  Abriendo el libro en un servidor local...
echo.

where powershell >nul 2>nul
if errorlevel 1 (
  echo  No se encontro PowerShell en este equipo.
  echo  Puedes abrir index.html directamente, aunque algunas funciones
  echo  como los mensajes o el modo sin conexion necesitan un servidor.
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve.ps1" %*

if errorlevel 1 (
  echo.
  echo  El servidor termino con un error.
  pause
)
endlocal
