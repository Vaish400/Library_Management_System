# Fix Database Connection Error

## Error Message
```
Access denied for user 'root'@'localhost' (using password: YES)
```

## Solution

### Step 1: Update MySQL Password in .env

1. Open `server/.env` file
2. Find this line:
   ```env
   DB_PASSWORD=your_mysql_password_here
   ```
3. Replace `your_mysql_password_here` with your **actual MySQL root password**

   Example:
   ```env
   DB_PASSWORD=mypassword123
   ```

### Step 2: If You Don't Know Your MySQL Password

**Option A: Reset MySQL Password**
1. Stop MySQL service
2. Start MySQL in safe mode (skip password)
3. Reset password
4. Restart MySQL

**Option B: Create a New MySQL User**
```sql
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'new_password';
GRANT ALL PRIVILEGES ON library_db.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```env
DB_USER=library_user
DB_PASSWORD=new_password
```

### Step 3: Verify Database Exists

1. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Check if database exists:
   ```sql
   SHOW DATABASES;
   ```

3. If `library_db` doesn't exist, create it:
   ```sql
   CREATE DATABASE library_db;
   ```

4. Run the schema:
   ```bash
   mysql -u root -p library_db < database/schema.sql
   ```

### Step 4: Test Database Connection

Run the diagnostic script:
```bash
cd server
node check-database.js
```

### Step 5: Restart Server

After updating `.env`:
```bash
cd server
npm start
```

## Quick Checklist

- [ ] Updated `DB_PASSWORD` in `server/.env` with actual MySQL password
- [ ] MySQL service is running
- [ ] Database `library_db` exists
- [ ] Tables exist (run `database/schema.sql`)
- [ ] Restarted server after updating `.env`

## Common Issues

### Issue: "Access denied" error persists
- **Solution**: Double-check the password in `.env` matches your MySQL password
- Try connecting manually: `mysql -u root -p` and enter your password

### Issue: "Database doesn't exist"
- **Solution**: Run `CREATE DATABASE library_db;` in MySQL

### Issue: "Table doesn't exist"
- **Solution**: Run `database/schema.sql` to create all tables

### Issue: MySQL not running
- **Windows**: Check Services, start MySQL service
- **Linux/Mac**: `sudo service mysql start` or `brew services start mysql`
