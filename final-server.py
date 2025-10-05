#!/usr/bin/env python3

import os
import sys
import http.server
import socketserver
import webbrowser
from pathlib import Path

# Get the directory where this script is located
script_dir = Path(__file__).parent.absolute()
dist_dir = script_dir / 'dist'

print("🍵 Teaflow Tea Brewing App Server")
print(f"📂 Script location: {script_dir}")
print(f"📁 Serving from: {dist_dir}")

# Check if dist directory exists
if not dist_dir.exists():
    print("❌ dist directory not found!")
    print("🔧 Run this first: npm run build")
    sys.exit(1)

# Change to the dist directory
os.chdir(dist_dir)

# Find available port
port = 8090
while port < 9000:
    try:
        with socketserver.TCPServer(("127.0.0.1", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"✅ Found available port: {port}")
            print(f"🚀 Server starting on: http://127.0.0.1:{port}")
            print(f"📱 Your Teaflow app: http://localhost:{port}")
            print("🛑 Press Ctrl+C to stop the server")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f"http://localhost:{port}")
            except:
                pass
                
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            port += 1
            continue
        else:
            print(f"❌ Server error: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)

print("❌ No available ports found (8090-8999)")
sys.exit(1)