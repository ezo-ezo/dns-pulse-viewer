# DNS Analyzer Backend - Quick Setup

## Installation

1. **Create package.json** (if not exists):
```bash
npm init -y
```

2. **Set module type** - Edit `package.json` and add:
```json
{
  "type": "module"
}
```

3. **Install dependencies**:
```bash
npm install cap dns-packet ws
```

## Running

**Linux/Mac:**
```bash
sudo node backend-server.js
```

**Windows (Administrator terminal):**
```bash
node backend-server.js
```

## What You'll See

```
==============================================
🚀 Live DNS Analyzer Backend
==============================================
Network Device: en0
LAN IP: 192.168.1.100
WebSocket Server: ws://192.168.1.100:3001
Filter: udp port 53

📡 Waiting for DNS packets...

==============================================
```

## Frontend Connection

In your React app at `/dns`, set the WebSocket URL to:
- **Local:** `ws://localhost:3001`
- **LAN:** `ws://192.168.1.100:3001` (your actual IP)

## Testing

1. Start the backend
2. Open the frontend at `/dns`
3. Open websites or run DNS queries
4. Watch live results appear!

## Troubleshooting

❌ **"Permission denied"** → Run with `sudo` (Linux/Mac) or as Administrator (Windows)

❌ **"Cannot find device"** → Check your network interface is active

❌ **No packets showing** → Generate DNS traffic by opening websites

See `backend-setup.md` for detailed troubleshooting.
