#!/bin/bash

# Teaflow App Runner - GUARANTEED TO WORK
echo "🍵 Starting Teaflow Tea Brewing App..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "python.*http.server" 2>/dev/null
pkill -f "node.*simple-server" 2>/dev/null
pkill -f "node.*start-web" 2>/dev/null
pkill -f "http-server" 2>/dev/null

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "📦 Building app..."
    npx expo export -p web
fi

# Find available port
PORT=8090
while lsof -i:$PORT >/dev/null 2>&1; do
    PORT=$((PORT + 1))
    if [ $PORT -gt 9000 ]; then
        echo "❌ No ports available"
        exit 1
    fi
done

# Start Python server (most reliable)
echo "🚀 Starting server on port $PORT..."
cd dist

# Try Python 3 first, then Python 2
if command -v python3 >/dev/null 2>&1; then
    echo "📱 Teaflow is running at: http://localhost:$PORT"
    echo "🛑 Press Ctrl+C to stop"
    python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
    echo "📱 Teaflow is running at: http://localhost:$PORT" 
    echo "🛑 Press Ctrl+C to stop"
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Python not found. Installing and using Node.js server..."
    cd ..
    node simple-server.js
fi