#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const distPath = path.join(__dirname, 'dist');

// Serve static files
app.use(express.static(distPath));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Try different ports until we find one that works
const tryPorts = [3000, 3001, 3002, 8080, 8081, 8000, 9000];

function tryPort(ports, index = 0) {
  if (index >= ports.length) {
    console.error('❌ Could not find an available port');
    process.exit(1);
  }
  
  const port = ports[index];
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`
🎉 Teaflow app is running!

📱 Open in browser: http://localhost:${port}

🛑 Press Ctrl+C to stop
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} busy, trying ${ports[index + 1]}...`);
      tryPort(ports, index + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    server.close(() => process.exit(0));
  });
}

// Check if dist exists
if (!fs.existsSync(distPath)) {
  console.log('❌ dist folder not found. Run: npm run build');
  process.exit(1);
}

console.log('🚀 Starting server...');
tryPort(tryPorts);