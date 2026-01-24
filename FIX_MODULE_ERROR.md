# Fix MODULE_NOT_FOUND Error

## Problem
The server is failing to start because `multer` module is not installed.

## Solution

### Step 1: Install Missing Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

This will install all dependencies including `multer` which is needed for file uploads.

### Step 2: Verify Installation

Check if multer is installed:

```bash
npm list multer
```

You should see `multer@1.4.5-lts.1` or similar.

### Step 3: Start Server

```bash
npm start
# or for development
npm run dev
```

## If Still Having Issues

### Check node_modules

Make sure `node_modules` folder exists in the `server` directory:

```bash
cd server
ls node_modules
# or on Windows
dir node_modules
```

### Reinstall Everything

If dependencies are corrupted:

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell:
```powershell
cd server
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Verify package.json

Make sure `package.json` includes multer:

```json
"dependencies": {
  "multer": "^1.4.5-lts.1",
  ...
}
```

## What Was Fixed

1. ✅ Removed unnecessary `multer` require from `server.js` (it's only needed in upload middleware)
2. ✅ Fixed duplicate line in `bookController.js`
3. ✅ Updated error handling to work without direct multer import

After running `npm install`, your server should start successfully!
