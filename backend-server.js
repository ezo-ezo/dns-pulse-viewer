/**
 * Live DNS Analyzer Backend
 * Captures DNS traffic from LAN devices and sends it in real-time to frontend via WebSocket
 * 
 * SETUP:
 * 1. npm install cap dns-packet ws
 * 2. Run with elevated privileges: sudo node backend-server.js (Linux/Mac) or run as Administrator (Windows)
 * 3. Frontend will connect to ws://<your-lan-ip>:3001
 */

import { networkInterfaces } from "os";
import { Cap } from "cap";
import dnsPacket from "dns-packet";
import { WebSocketServer } from "ws";

const PORT = 3001; // WebSocket port

// === Helper: get LAN IP ===
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

const LAN_IP = getLocalIP();

// === WebSocket Server (listen on 0.0.0.0 for LAN access) ===
const wss = new WebSocketServer({ 
  port: PORT,
  host: '0.0.0.0'
});

let connectedClients = 0;

wss.on("connection", (ws) => {
  connectedClients++;
  console.log(`✓ Frontend connected via WebSocket (${connectedClients} clients)`);
  
  ws.on("close", () => {
    connectedClients--;
    console.log(`✗ Client disconnected (${connectedClients} clients remaining)`);
  });
  
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// === Capture DNS packets ===
try {
  const c = new Cap();
  const device = Cap.findDevice(LAN_IP);
  const filter = "udp port 53"; // DNS packets
  const bufSize = 10 * 1024 * 1024;
  const buffer = Buffer.alloc(65535);

  console.log('\n==============================================');
  console.log('🚀 Live DNS Analyzer Backend');
  console.log('==============================================');
  console.log(`Network Device: ${device}`);
  console.log(`LAN IP: ${LAN_IP}`);
  console.log(`WebSocket Server: ws://${LAN_IP}:${PORT}`);
  console.log(`Filter: ${filter}`);
  console.log('\n📡 Waiting for DNS packets...\n');
  console.log('==============================================\n');

  const linkType = c.open(device, filter, bufSize, buffer);
  c.setMinBytes && c.setMinBytes(0);

  let packetCount = 0;

  c.on("packet", (nbytes, trunc) => {
    try {
      // Parse Ethernet + IP + UDP headers to get to DNS payload
      const ethOffset = 14; // Ethernet header
      const ipHeaderLen = ((buffer[ethOffset] & 0x0f) * 4); // IP header length
      const udpOffset = ethOffset + ipHeaderLen;
      const dnsOffset = udpOffset + 8; // UDP header is 8 bytes
      
      const dnsData = buffer.slice(dnsOffset, nbytes);
      const packet = dnsPacket.decode(dnsData);

      if (packet.questions && packet.questions.length > 0) {
        packetCount++;
        
        const data = {
          id: packet.id,
          domain: packet.questions[0].name,
          type: packet.questions[0].type,
          timestamp: new Date().toISOString(),
          packetNumber: packetCount
        };

        console.log(`[${packetCount}] DNS Query: ${data.domain} (${data.type})`);

        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // 1 = OPEN
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (err) {
      // Ignore decoding errors (some packets may not be valid DNS)
    }
  });

} catch (error) {
  console.error('\n❌ Error starting DNS capture:');
  console.error(error.message);
  console.error('\n💡 Make sure to run with elevated privileges:');
  console.error('   Linux/Mac: sudo node backend-server.js');
  console.error('   Windows: Run terminal as Administrator\n');
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down DNS Analyzer Backend...');
  wss.close();
  process.exit(0);
});
