@echo off
cd /d %~dp0

echo Starting TD Scoreboard...
echo Press Ctrl+C to stop.

start http://localhost:3000
call npx serve -s . -l 3000
pause
