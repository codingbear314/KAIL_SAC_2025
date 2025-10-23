#!/bin/bash

echo "KAIL SAC 2025 - Backend Server"
echo "=============================="
echo ""

if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found"
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "Starting server on http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""

python3 server.py
