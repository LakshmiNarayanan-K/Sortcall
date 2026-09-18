@echo off
cd /d "%~dp0"
echo.
echo  ============================================
echo   SortCall key saver
echo  ============================================
echo.
echo  STEP 1: Copy your API key first (it starts with AIza)
echo  STEP 2: Right-click inside this window to paste it
echo.
set /p KEY=Paste key here and press Enter: 
> .env.local echo GOOGLE_GENERATIVE_AI_API_KEY=%KEY%
echo.
echo  Done! Key saved correctly. You can close this window.
echo  Then go back to Codebuff and say: done
echo.
pause
