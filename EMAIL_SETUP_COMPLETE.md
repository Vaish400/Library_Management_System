# Email Setup - Complete Guide

## ✅ Current Configuration

Your email is already configured in `server/.env`:
```
SMTP_USER=bulkemailservice1@gmail.com
SMTP_PASS=rsvswrdgvkjuibfi
```

## 📧 How Email Works

1. **User enters email** in login form (e.g., `student@example.com`)
2. **System finds user** in database with that email
3. **OTP is generated** (6-digit code)
4. **Email is sent** from `bulkemailservice1@gmail.com` to the user's registered email (`student@example.com`)
5. **User receives OTP** in their email inbox

## 🔍 Email Flow

```
Login Form → Database Query → Get User Email → Send OTP Email → User's Inbox
```

The email is **always sent to the user's registered email address** (the one they entered in the login form and is stored in the database).

## ⚠️ Important: Fix Database First

**Before emails can work, you must fix the database connection:**

1. **Update `server/.env`** with your MySQL password:
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```

2. **Restart server:**
   ```bash
   cd server
   npm start
   ```

3. **Verify database connection:**
   - You should see: `✅ Database connection pool initialized`
   - Not: `⚠️ Database connection warning`

## 📬 Testing Email

Once database is fixed:

1. **Register a user** (if not already registered)
2. **Go to login page**
3. **Enter the registered email**
4. **Click "Send OTP"**
5. **Check the email inbox** (and spam folder)

## 🔍 Server Logs

When email is sent successfully, you'll see in server console:
```
📧 Preparing to send OTP email to: user@example.com
   User: John Doe
   From: bulkemailservice1@gmail.com
✅ OTP email sent successfully to user@example.com
   Message ID: <message-id>
```

## ❌ Troubleshooting

### Email not received?
1. **Check spam/junk folder**
2. **Verify email address** is correct in database
3. **Check server console** for email errors
4. **Verify Gmail App Password** is correct

### Database connection error?
- Update `DB_PASSWORD` in `server/.env`
- Ensure MySQL is running
- Run `node check-database.js` to test connection

### Email authentication error?
- Verify Gmail App Password (not regular password)
- Check 2-Step Verification is enabled
- Ensure password has no spaces in `.env`

## ✅ Verification Checklist

- [ ] Database connection working (no warnings in server console)
- [ ] Email credentials set in `.env` (SMTP_USER and SMTP_PASS)
- [ ] User registered in database
- [ ] Server restarted after any changes
- [ ] Check email inbox (and spam) for OTP

## 📝 Summary

**Email is configured correctly!** It will send to the user's registered email address once the database connection is fixed. The email will come from `bulkemailservice1@gmail.com` and go to the email address the user entered in the login form.
