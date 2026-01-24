# Email Configuration Guide

This guide will help you set up email functionality for OTP authentication using your own valid email account.

## 🔐 Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Or navigate: **Security** → **2-Step Verification** → **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "Library Management System" as the name
6. Click **Generate**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure .env File

In your `server/.env` file, add:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

**Important:** 
- Use the 16-character app password (remove spaces if any)
- Do NOT use your regular Gmail password
- Keep your `.env` file secure and never commit it to Git

## 📧 Other Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

### Custom SMTP Server

```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password
```

## ✅ Testing Email Configuration

1. Make sure your `.env` file is configured correctly
2. Start your server: `cd server && npm start`
3. Try to register a new user or request OTP
4. Check the server logs for email sending status
5. Check your email inbox (and spam folder) for the OTP

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git** - It's already in `.gitignore`
2. **Use App Passwords** - Don't use your main account password
3. **Rotate passwords regularly** - Change app passwords periodically
4. **Use environment-specific configs** - Different credentials for dev/prod

## 🐛 Troubleshooting

### "Invalid login" or "Authentication failed"

- **Gmail**: Make sure you're using an App Password, not your regular password
- **2-Step Verification**: Must be enabled for Gmail App Passwords
- **Check credentials**: Verify SMTP_USER and SMTP_PASS in `.env`

### "Connection timeout"

- Check your firewall settings
- Verify SMTP_HOST and SMTP_PORT are correct
- Some networks block SMTP ports - try a different network

### "Email not received"

- Check spam/junk folder
- Verify the recipient email address is correct
- Check server logs for error messages
- Test with a different email provider

### "Less secure app access" error (Gmail)

- Gmail no longer supports "less secure apps"
- **Solution**: Use App Passwords instead (see Step 2 above)

## 📝 Example .env Configuration

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=library_db

# JWT Secret (generate a random string)
JWT_SECRET=my_super_secret_jwt_key_12345

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myemail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

## 🚀 Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit `.env` and add your email credentials

3. Restart your server

4. Test by registering a new user - you should receive an OTP email!

---

**Need Help?** If you're still having issues, check:
- Server console logs for detailed error messages
- Email provider's SMTP documentation
- Firewall/antivirus settings blocking SMTP
