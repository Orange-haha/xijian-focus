@echo off
setlocal
title Xijian Focus
cd /d "%~dp0"

set "CODEX_NODE=C:\Users\Lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "CODEX_PNPM=C:\Users\Lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
set "VITE_JS=%CD%\node_modules\vite\bin\vite.js"

if /I "%~1"=="--check" goto check

echo.
echo   XIJIAN FOCUS
echo   ================================
echo.

if not exist "%VITE_JS%" (
  echo   First-time setup. Please wait...
  if exist "%CODEX_PNPM%" (
    call "%CODEX_PNPM%" install
  ) else (
    where pnpm >nul 2>nul
    if not errorlevel 1 (
      call pnpm install
    ) else (
      where npm >nul 2>nul
      if not errorlevel 1 (
        call npm install
      ) else (
        echo.
        echo   Runtime not found. Please ask Codex for help.
        echo.
        pause
        exit /b 1
      )
    )
  )

  if errorlevel 1 (
    echo.
    echo   Setup failed. Check your network and try again.
    echo.
    pause
    exit /b 1
  )
)

echo   Starting the website...
echo   Your browser will open automatically.
echo   Close this window to stop the website.
echo.

if exist "%CODEX_NODE%" (
  "%CODEX_NODE%" "%VITE_JS%" --host 127.0.0.1 --open
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo   Node.js not found. Please ask Codex for help.
    pause
    exit /b 1
  )
  node "%VITE_JS%" --host 127.0.0.1 --open
)

if errorlevel 1 (
  echo.
  echo   Startup failed. Please send a screenshot of this window to Codex.
  pause
)
exit /b

:check
if not exist "%CODEX_NODE%" (
  echo CHECK_FAILED: node not found
  exit /b 1
)
if not exist "%VITE_JS%" (
  echo CHECK_FAILED: dependencies not found
  exit /b 1
)
echo CHECK_OK
exit /b 0
