#!/usr/bin/env node

const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
let PORT = process.env.PORT || 3000;

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('🔄 Building app first...');
  exec('npx expo export -p web', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
    console.log('✅ Build completed');
    startServer();
  });
} else {
  startServer();
}

function findFreePort(port) {
  return new Promise((resolve) => {
    const testServer = app.listen(port, '0.0.0.0', () => {
      testServer.close(() => {
        resolve(port);
      });
    });
    
    testServer.on('error', () => {
      resolve(findFreePort(port + 1));
    });
  });
}

async function startServer() {
  // Serve static files from dist directory
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Find a free port
  const freePort = await findFreePort(PORT);
  
  // Start server
  const server = app.listen(freePort, '0.0.0.0', () => {
    console.log(`
🎉 Teaflow app is running successfully!

📱 Access your app at:
   • http://localhost:${freePort}
   • http://127.0.0.1:${freePort}
   • http://0.0.0.0:${freePort}

🔄 The server is properly bound and accessible.
🛑 Press Ctrl+C to stop the server
    `);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
}