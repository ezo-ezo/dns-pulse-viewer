# Live DNS Analyzer - Backend Setup Guide

## Overview

This backend captures live DNS traffic from your LAN network and streams it to the frontend in real-time using WebSockets.

## Prerequisites

- Node.js (v16 or higher)
- Administrator/root privileges (required for packet capture)
- Network interface with DNS traffic

## Quick Start

### 1. Install Dependencies

```bash
npm install cap dns-packet ws
```

**Required packages:**
- `cap` - Network packet capture library
- `dns-packet` - DNS packet parser
- `ws` - WebSocket server

### 2. Run the Backend

**Linux/Mac:**
```bash
sudo node backend-server.js
```

**Windows:**
```bash
# Run terminal as Administrator, then:
node backend-server.js
```

⚠️ **Important:** Elevated privileges are required to capture network packets.

### 3. Configure Frontend

The frontend will connect to:
- **Local:** `ws://localhost:3001`
- **LAN:** `ws://192.168.1.100:3001` (use your actual LAN IP)

## How It Works

### Backend Architecture

1. **Packet Capture**: Uses `cap` library to sniff UDP packets on port 53 (DNS)
2. **Packet Parsing**: Decodes DNS packets using `dns-packet`
3. **WebSocket Streaming**: Broadcasts DNS queries to all connected frontends in real-time
4. **LAN Access**: Listens on `0.0.0.0` to accept connections from any device on the network

### Data Flow

```
LAN Devices → DNS Queries → Backend (captures) → WebSocket → Frontend (displays)
```

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

1. Start backend on your main machine:
   ```bash
   sudo node backend-server.js
   ```

2. Note the LAN IP displayed (e.g., `192.168.1.100`)

3. On frontend, set WebSocket URL to:
   ```
   ws://192.168.1.100:3001
   ```

4. Open the React app from any LAN device:
   ```
   http://192.168.1.100:8080/dns
   ```

## Frontend Integration

The `DNSAnalyzer.tsx` component connects via WebSocket and displays:
- Packet number
- Domain queried
- Query type (A, AAAA, MX, etc.)
- Timestamp

### WebSocket Message Format

```json
{
  "id": 12345,
  "domain": "example.com",
  "type": "A",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "packetNumber": 42
}
```

## Troubleshooting

### "Permission denied" error

**Solution:** Run with elevated privileges
```bash
# Linux/Mac
sudo node backend-server.js

# Windows
# Run terminal as Administrator
```

### "Cannot find device" error

**Solution:** Check if your network interface is active
```bash
# List network devices
npm install -g cap
node -e "const Cap = require('cap').Cap; console.log(Cap.deviceList())"
```

### No DNS packets captured

**Possible causes:**
1. No DNS traffic on your network
2. Wrong network interface selected
3. Firewall blocking packet capture

**Solution:** 
- Open websites on your computer to generate DNS queries
- Check firewall settings
- Verify the correct network interface is being used

### Frontend cannot connect

**Check:**
1. Backend is running
2. Correct WebSocket URL (ws://, not http://)
3. Firewall allows port 3001
4. Both devices on same LAN

### Firewall Configuration

**Windows:**
```bash
netsh advfirewall firewall add rule name="DNS Analyzer WS" dir=in action=allow protocol=TCP localport=3001
```

**Linux (UFW):**
```bash
sudo ufw allow 3001/tcp
```

**Mac:**
System Preferences → Security & Privacy → Firewall → Firewall Options → Allow Node.js

## Running Both Frontend and Backend

### Terminal 1 - Backend
```bash
sudo node backend-server.js
```

### Terminal 2 - Frontend (Vite)
```bash
npm run dev -- --host
```

The `--host` flag allows LAN access to the Vite dev server.

## Testing the Setup

1. **Start backend** with elevated privileges
2. **Open frontend** at `/dns` route
3. **Verify connection** - should show "Connected" badge
4. **Generate DNS traffic**:
   - Open websites in browser
   - Run `nslookup google.com` in terminal
   - Use apps that make network requests
5. **Watch live results** appear in frontend

## Demo for College Review

### Single Machine Demo
```bash
# Terminal 1
sudo node backend-server.js

# Terminal 2
npm run dev
```
Navigate to: `http://localhost:8080/dns`

### Multi-Device Demo
```bash
# Main machine
sudo node backend-server.js

# Other devices
# Open: http://<main-machine-ip>:8080/dns
```

All devices will see the same live DNS traffic from the network.

## Production Deployment

For production, consider:
- ✓ Use environment variables for configuration
- ✓ Add rate limiting to WebSocket
- ✓ Implement authentication
- ✓ Use PM2 for process management
- ✓ Add logging and monitoring
- ✓ Deploy on a dedicated server

```bash
npm install -g pm2
pm2 start backend-server.js --name dns-analyzer
pm2 startup
pm2 save
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Packet capture requires root** - Be careful with elevated privileges
2. **No authentication** - Current setup has no auth (add for production)
3. **LAN only** - Don't expose to public internet without security
4. **Privacy** - DNS queries may contain sensitive information
5. **CORS** - WebSocket accepts all connections (restrict in production)

## Technical Details

### Packet Structure Parsing

The backend parses Ethernet → IP → UDP → DNS:
```
Ethernet (14 bytes) → IP (variable) → UDP (8 bytes) → DNS (variable)
```

### Performance

- **Buffer size:** 10 MB
- **Results limit:** Last 100 queries (frontend)
- **WebSocket:** Real-time, low latency
- **CPU usage:** Minimal (~1-2%)

## Additional Resources

- [cap library docs](https://github.com/mscdex/cap)
- [dns-packet docs](https://github.com/mafintosh/dns-packet)
- [ws library docs](https://github.com/websockets/ws)

## Support

If you encounter issues:
1. Check console logs (both backend and frontend)
2. Verify elevated privileges
3. Confirm network interface is active
4. Test with simple DNS queries (`nslookup google.com`)
5. Check firewall settings

## Notes

- Backend must run with elevated privileges for packet capture
- WebSocket runs on port 3001
- Frontend connects via WebSocket (not HTTP)
- All devices on the same LAN will see the same DNS traffic
- Results are not persisted (in-memory only)
