# Fix "Port Already in Use" Error

## Problem
Error: `EADDRINUSE: address already in use :::5000`

This means another process is already using port 5000.

## Quick Solutions

### Option 1: Kill the Process (Windows)

**Method A: Using the script**
```bash
cd server
npm run kill-port
```

**Method B: Manual commands**
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it (replace <PID> with the actual PID from above)
taskkill /PID <PID> /F
```

**Method C: Kill all Node processes**
```bash
taskkill /IM node.exe /F
```

### Option 2: Change Port

Edit `server/.env` file:
```env
PORT=5001
```

Then restart the server.

### Option 3: Find What's Using the Port

1. Open Command Prompt as Administrator
2. Run:
   ```bash
   netstat -ano | findstr :5000
   ```
3. Note the PID (last column)
4. Check what it is:
   ```bash
   tasklist | findstr <PID>
   ```
5. Kill it if it's an old server instance:
   ```bash
   taskkill /PID <PID> /F
   ```

## Prevention

The server now shows a helpful error message with instructions when this happens.

## After Fixing

Restart your server:
```bash
cd server
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
```
