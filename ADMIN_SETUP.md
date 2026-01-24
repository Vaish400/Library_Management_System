# Admin Access Setup Guide

If you're getting "Access denied. Admin privileges required" error, you need to promote a user to admin role.

## 🔧 Method 1: Using the Script (Recommended)

1. Navigate to server directory:
```bash
cd server
```

2. Run the makeAdmin script:
```bash
node scripts/makeAdmin.js
```

3. Enter the email of the user you want to make admin

4. The user must **logout and login again** for the changes to take effect

## 🔧 Method 2: Direct SQL Update

1. Connect to MySQL:
```bash
mysql -u root -p
```

2. Use the database:
```sql
USE library_db;
```

3. View all users:
```sql
SELECT id, name, email, role FROM users;
```

4. Update a user to admin (replace `user@example.com` with actual email):
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

5. Verify the change:
```sql
SELECT id, name, email, role FROM users WHERE email = 'user@example.com';
```

## 🔧 Method 3: Register as Admin

When registering a new user through the web interface:

1. Go to `/register`
2. Fill in the registration form
3. **Select "Admin" from the Role dropdown**
4. Complete registration
5. Login with OTP

## 🔧 Method 4: Create Admin via SQL (First Time Setup)

If you don't have any users yet, you can create an admin user directly:

1. Connect to MySQL:
```bash
mysql -u root -p
USE library_db;
```

2. Generate a password hash (you'll need to use Node.js or an online bcrypt tool):
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(hash => console.log(hash));"
```

3. Insert admin user (replace the hash with the one from step 2):
```sql
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@library.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'admin');
```

**Note:** This method requires you to hash the password first. It's easier to use Method 3 (register through UI) or Method 2 (update existing user).

## ✅ Verify Admin Access

After promoting a user to admin:

1. **Important:** The user must logout and login again
2. The JWT token contains the role, so a new login is required
3. After re-login, you should see "👨‍💼 Admin" in the navbar
4. You should be able to access:
   - Add Book page
   - Manage Issues page (with all users' issues)
   - User management (if implemented)

## 🐛 Troubleshooting

### "User not found" error
- Check the email spelling
- Verify the user exists: `SELECT * FROM users;`

### Changes not taking effect
- **User must logout and login again** - JWT tokens contain the role
- Clear browser localStorage if needed
- Check the database: `SELECT role FROM users WHERE email = 'your@email.com';`

### Still getting "Access denied"
- Verify the role in database: `SELECT email, role FROM users;`
- Make sure you logged out and logged back in
- Check browser console for any errors
- Verify the JWT token contains the correct role (check Network tab in browser DevTools)

## 📝 Quick SQL Commands

```sql
-- View all users and their roles
SELECT id, name, email, role FROM users;

-- Make a user admin
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';

-- Make a user student
UPDATE users SET role = 'student' WHERE email = 'your@email.com';

-- Check specific user's role
SELECT name, email, role FROM users WHERE email = 'your@email.com';
```
