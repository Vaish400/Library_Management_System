# Quick Fix: "Access denied. Admin privileges required"

## 🚀 Fastest Solution (Choose One)

### Option 1: Use the Script (30 seconds)

```bash
cd server
node scripts/makeAdmin.js
```

Enter your email when prompted. Then **logout and login again**.

### Option 2: SQL Command (20 seconds)

1. Open MySQL:
```bash
mysql -u root -p
```

2. Run:
```sql
USE library_db;
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

3. **Logout and login again** in the web app.

### Option 3: Register as Admin

1. Go to `/register` in your browser
2. Fill the form and **select "Admin" from Role dropdown**
3. Complete registration
4. Login with OTP

### Option 4: Use API (if no admins exist yet)

If you're the first user and no admins exist, you can promote yourself:

```bash
# Get your user ID first (login and check the response, or use SQL: SELECT id FROM users WHERE email='your@email.com')
curl -X PUT http://localhost:5000/api/auth/users/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"userId": 1, "role": "admin"}'
```

## ⚠️ Important

After changing your role to admin, you **MUST logout and login again** because:
- JWT tokens contain the role information
- Old tokens still have "student" role
- New login will generate a token with "admin" role

## ✅ Verify It Worked

1. Logout from the app
2. Login again with OTP
3. Check the navbar - you should see "👨‍💼 Admin"
4. You should now be able to access:
   - Add Book page
   - Manage Issues (all users)
   - User management

---

**Still having issues?** See `ADMIN_SETUP.md` for detailed troubleshooting.
