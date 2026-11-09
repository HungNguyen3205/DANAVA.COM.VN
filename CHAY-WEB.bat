@echo off
chcp 65001 >nul
title DANAVA Website
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [DANAVA] Chua cai Node.js. Tai ban 24 tro len tai https://nodejs.org/ roi chay lai file nay.
  pause
  exit /b 1
)

echo.
echo   ============================================
echo     DANAVA SOLUTIONS - CHAY WEBSITE TREN MAY
echo   ============================================
echo     1. Chay thu  (sua code thay ngay, cong 3123)
echo     2. Chay ban hoan thien (build production, cong 3100)
echo   ============================================
echo.
set /p MODE="  Chon 1 hoac 2 roi Enter [mac dinh 1]: "

if "%MODE%"=="2" (
  node scripts\run-local.mjs --prod
) else (
  node scripts\run-local.mjs
)

echo.
pause
