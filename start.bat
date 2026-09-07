@echo off
echo ====================================================
echo Starting SwishView WorkHub (Backend + Frontend)
echo ====================================================

echo Starting Spring Boot Backend...
start "SwishView Backend" cmd /k "cd backend && mvn spring-boot:run"

echo Starting React Frontend...
start "SwishView Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are launching in separate windows!
