#!/bin/bash
# Phoenix2 - Stop Services

echo "Stopping Phoenix2 services..."

# Stop backend (uvicorn)
pkill -f "uvicorn.*8000" 2>/dev/null
pkill -f "python.*server.py" 2>/dev/null

# Stop frontend (vite)
pkill -f "vite.*3000" 2>/dev/null
pkill -f "node.*vite" 2>/dev/null

echo "Phoenix2 services stopped."
