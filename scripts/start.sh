#!/bin/bash
# Phoenix2 - Start Services
# Usage: ./scripts/start.sh [--bg]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

BG_MODE=false
if [[ "$1" == "--bg" ]]; then
    BG_MODE=true
fi

echo "========================================"
echo "  Phoenix2 - Board Emulation Platform"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found"
    exit 1
fi

# Install backend dependencies if needed
echo "Checking backend dependencies..."
cd "$BACKEND_DIR"
pip3 install -q fastapi uvicorn python-multipart pyyaml 2>/dev/null

# Install frontend dependencies if needed
echo "Checking frontend dependencies..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start backend
echo ""
echo "Starting backend on port 8000..."
cd "$BACKEND_DIR"
if [ "$BG_MODE" = true ]; then
    nohup python3 server.py > /tmp/phoenix2_backend.log 2>&1 &
    echo "Backend PID: $!"
else
    python3 server.py &
    BACKEND_PID=$!
fi

sleep 2

# Start frontend
echo "Starting frontend on port 3000..."
cd "$FRONTEND_DIR"
if [ "$BG_MODE" = true ]; then
    nohup npm run dev > /tmp/phoenix2_frontend.log 2>&1 &
    echo "Frontend PID: $!"
else
    npm run dev &
    FRONTEND_PID=$!
fi

echo ""
echo "========================================"
echo "  Phoenix2 Services Started"
echo "========================================"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""

if [ "$BG_MODE" = false ]; then
    echo "Press Ctrl+C to stop all services"
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
fi
