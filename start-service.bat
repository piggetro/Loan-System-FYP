@echo off

REM Start Next.js application
start "" /b cmd.exe /c "npm start"

REM Start Caddy
start "" /b cmd.exe /c "caddy start --config Caddyfile"
