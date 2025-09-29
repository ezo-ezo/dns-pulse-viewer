/**
 * DNS Packet Analyzer - Backend Server
 * 
 * This Node.js server provides DNS query functionality for LAN networks.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install dependencies: npm install express cors dns
 * 2. Run the server: node backend-server.js
 * 3. For LAN access, find your IP: ipconfig (Windows) or ifconfig (Linux/Mac)
 * 4. Update frontend with your LAN IP (e.g., http://192.168.1.100:3001)
 * 
 * MULTI-NODE SETUP:
 * - Run this server on multiple devices on the same LAN
 * - Each server will have a unique NODE_ID
 * - Configure different ports if running on same machine (PORT env variable)
 */

const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ID = process.env.NODE_ID || os.hostname();

// Enable CORS for all origins (required for LAN access)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Helper function to get local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(interfaceName => {
    interfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });
  
  return ips;
}

// Root endpoint - Server info
app.get('/', (req, res) => {
  const localIPs = getLocalIPs();
  res.json({
    message: 'DNS Packet Analyzer Backend',
    nodeId: NODE_ID,
    localIPs,
    endpoints: {
      dnsQuery: '/api/dns-query?domain=<domain>',
      health: '/api/health'
    },
    instructions: {
      frontend: `Set backend URL to: http://${localIPs[0] || 'localhost'}:${PORT}`,
      multiNode: 'Set NODE_ID env variable to identify different nodes'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    nodeId: NODE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// DNS Query endpoint
app.get('/api/dns-query', async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({
        error: 'Domain parameter is required',
        example: '/api/dns-query?domain=google.com'
      });
    }

    console.log(`[${NODE_ID}] DNS query for: ${domain}`);

    // Perform DNS lookup
    const addresses = await dns.resolve4(domain);
    const ip = addresses[0]; // Get first IPv4 address

    const result = {
      domain,
      ip,
      family: 'IPv4',
      timestamp: new Date().toISOString(),
      nodeId: NODE_ID,
      allAddresses: addresses
    };

    console.log(`[${NODE_ID}] Resolved ${domain} -> ${ip}`);

    res.json(result);
  } catch (error) {
    console.error(`[${NODE_ID}] DNS query error:`, error.message);
    
    res.status(500).json({
      error: 'DNS resolution failed',
      message: error.message,
      domain: req.query.domain,
      nodeId: NODE_ID
    });
  }
});

// Store recent queries (in-memory for demo)
let recentQueries = [];

// Get recent queries endpoint
app.get('/api/recent-queries', (req, res) => {
  res.json({
    nodeId: NODE_ID,
    queries: recentQueries.slice(-50) // Last 50 queries
  });
});

// Log query to memory
app.use('/api/dns-query', (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        recentQueries.push({
          ...result,
          queriedAt: new Date().toISOString()
        });
      } catch (e) {
        // Ignore parse errors
      }
    }
    originalSend.call(this, data);
  };
  next();
});

// Start server on 0.0.0.0 to allow LAN connections
app.listen(PORT, '0.0.0.0', () => {
  const localIPs = getLocalIPs();
  
  console.log('\n==============================================');
  console.log('🚀 DNS Packet Analyzer Backend Server');
  console.log('==============================================');
  console.log(`Node ID: ${NODE_ID}`);
  console.log(`Port: ${PORT}`);
  console.log('\n📡 Access URLs:');
  console.log(`   Localhost: http://localhost:${PORT}`);
  localIPs.forEach(ip => {
    console.log(`   LAN:       http://${ip}:${PORT}`);
  });
  console.log('\n📋 API Endpoints:');
  console.log(`   DNS Query:      GET /api/dns-query?domain=<domain>`);
  console.log(`   Health Check:   GET /api/health`);
  console.log(`   Recent Queries: GET /api/recent-queries`);
  console.log('\n💡 Multi-Node Setup:');
  console.log('   Run on multiple devices: NODE_ID=node1 node backend-server.js');
  console.log('   Different ports: PORT=3002 node backend-server.js');
  console.log('\n🔗 Update your React frontend with the LAN IP above');
  console.log('==============================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down DNS Analyzer Backend...');
  process.exit(0);
});
