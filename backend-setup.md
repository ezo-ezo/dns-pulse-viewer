# DNS Packet Analyzer - Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install express cors
```

Or create a `package.json` first:

```bash
npm init -y
npm install express cors
```

### 2. Run the Backend Server

```bash
node backend-server.js
```

The server will start on port 3001 and display your LAN IP addresses.

### 3. Configure Frontend

In the DNSAnalyzer page, update the backend URL to your LAN IP:
- Example: `http://192.168.1.100:3001`

## Running on LAN Network

### Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

### Access from Other Devices

1. Start the backend server on your main machine
2. Note the LAN IP displayed (e.g., `192.168.1.100`)
3. On other devices on the same network:
   - Open browser to: `http://192.168.1.100:8080` (React frontend)
   - The frontend will connect to: `http://192.168.1.100:3001` (backend)

## Multi-Node Setup

### Run Multiple Backend Instances

**On different machines:**
```bash
# Machine 1
NODE_ID=node1 node backend-server.js

# Machine 2 (different IP)
NODE_ID=node2 node backend-server.js
```

**On same machine (different ports):**
```bash
# Terminal 1
NODE_ID=node1 PORT=3001 node backend-server.js

# Terminal 2
NODE_ID=node2 PORT=3002 node backend-server.js
```

### Frontend Multi-Node Configuration

Create an array of backend URLs in your frontend:

```typescript
const backends = [
  'http://192.168.1.100:3001',
  'http://192.168.1.101:3001',
  'http://192.168.1.102:3001'
];
```

## API Endpoints

### DNS Query
```
GET /api/dns-query?domain=<domain>
```

Response:
```json
{
  "domain": "google.com",
  "ip": "142.250.185.78",
  "family": "IPv4",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "nodeId": "node1",
  "allAddresses": ["142.250.185.78", "142.250.185.79"]
}
```

### Health Check
```
GET /api/health
```

### Recent Queries
```
GET /api/recent-queries
```

## Running Both Frontend and Backend

### Terminal 1 - Backend
```bash
node backend-server.js
```

### Terminal 2 - Frontend (Vite)
```bash
npm run dev -- --host
```

The `--host` flag allows LAN access to the Vite dev server.

## Firewall Configuration

### Windows
```bash
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="DNS Analyzer Backend" dir=in action=allow protocol=TCP localport=3001
```

### Linux (UFW)
```bash
sudo ufw allow 3001/tcp
sudo ufw allow 8080/tcp
```

### Mac
System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections for Node.js

## Troubleshooting

### Cannot connect from other devices

1. **Check firewall:** Ensure ports 3001 and 8080 are open
2. **Verify IP:** Use `ipconfig` or `ifconfig` to confirm your IP
3. **Same network:** Ensure all devices are on the same LAN/WiFi
4. **CORS enabled:** The backend already has CORS enabled for all origins

### DNS query fails

1. **Backend running:** Check `http://localhost:3001/api/health`
2. **Network access:** Test from the same machine first
3. **Domain format:** Use just the domain name (e.g., "google.com", not "https://google.com")

### Port already in use

```bash
# Use different port
PORT=3002 node backend-server.js
```

## Demo for College Review

### Single Machine Demo
```bash
# Start backend
node backend-server.js

# Start frontend (separate terminal)
npm run dev
```

### Multi-Node Demo
```bash
# Machine/Device 1
NODE_ID=laptop node backend-server.js

# Machine/Device 2
NODE_ID=desktop node backend-server.js

# Access frontend from any device
# Open: http://<any-machine-ip>:8080/dns
```

## Production Deployment

For production, consider:
- Use environment variables for configuration
- Add rate limiting
- Implement authentication
- Use PM2 for process management
- Deploy backend separately (e.g., on a cloud server)

```bash
npm install -g pm2
pm2 start backend-server.js --name dns-analyzer
pm2 startup
pm2 save
```

## Notes

- The backend runs on `0.0.0.0` to accept connections from any network interface
- CORS is enabled for all origins for development
- DNS lookups use Node.js native `dns.promises` module
- Results are stored in memory (resets on server restart)
- For persistent storage, integrate with a database
