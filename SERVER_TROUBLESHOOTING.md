# Server Troubleshooting Guide

## Common Server Errors and Solutions

### 1. "Cannot find module" Error

**Solution:**
```bash
cd server
npm install
```

This installs all required dependencies.

### 2. Database Connection Error

**Error:** `Unknown database 'library_db'` or `Access denied`

**Solutions:**
1. **Create the database:**
   ```sql
   CREATE DATABASE library_db;
   ```

2. **Update `.env` file:**
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```

3. **Run the schema:**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### 3. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. **Kill the process:**
   ```bash
   npm run kill-port
   ```

2. **Or change the port in `.env`:**
   ```env
   PORT=5001
   ```

### 4. Missing Environment Variables

**Check your `.env` file has:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_db
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 5. Test Server Configuration

Run the diagnostic script:
```bash
cd server
node test-server.js
```

This will check:
- Environment variables
- Required modules
- File structure
- Server loading

### 6. Module Not Found After Installation

**Solution:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### 7. Database Query Errors

**Check:**
1. Database exists: `SHOW DATABASES;`
2. Tables exist: `USE library_db; SHOW TABLES;`
3. Run enhanced schema if needed: `database/schema_enhanced.sql`

### 8. File Upload Errors

**Check:**
1. `server/uploads/` directory exists (created automatically)
2. File size limits (100MB for books, 5MB for images)
3. File types are allowed (images: jpg, png, gif, webp | books: pdf, epub, mobi, txt, doc, docx)

## Quick Fix Checklist

- [ ] Run `npm install` in `server/` directory
- [ ] Check `.env` file exists and has correct values
- [ ] Database `library_db` exists
- [ ] MySQL is running
- [ ] Port 5000 is available
- [ ] All required files exist (check `test-server.js` output)

## Still Having Issues?

1. **Check server logs** - Look for specific error messages
2. **Run test script:** `node test-server.js`
3. **Verify database:** Connect to MySQL and check if database/tables exist
4. **Check Node.js version:** Should be v14+ (check with `node -v`)
