# Email Configuration Guide - Fix "Email not configured"

## Problem
You're seeing: "OTP: 843750 (Email not configured - shown for development)"

This means your email service is not configured in the `.env` file.

## Solution: Configure Email

### Step 1: Create/Edit `.env` file

Navigate to `server/` directory and create/edit `.env` file:

```bash
cd server
```

Create `.env` file with these contents:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_db
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration - REQUIRED for sending OTP emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

### Step 2: Get Gmail App Password

**IMPORTANT:** You CANNOT use your regular Gmail password. You MUST use an App Password.

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter "Library Management System"
   - Click "Generate"
   - Copy the 16-character password (it looks like: `abcd efgh ijkl mnop`)

3. **Add to `.env` file**:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   ```
   (Remove spaces from the app password)

### Step 3: Restart Server

After updating `.env`, restart your server:

```bash
cd server
npm start
```

### Step 4: Test

1. Go to login page
2. Enter your registered email
3. Click "Send OTP"
4. Check your email inbox (and spam folder)
5. You should receive the OTP email

## How It Works

1. **User enters email** in login form (e.g., `student@example.com`)
2. **System finds user** in database with that email
3. **OTP is generated** (6-digit code)
4. **Email is sent** to the user's registered email address (`student@example.com`)
5. **User receives OTP** in their email inbox

## Verification

After configuration, when you request OTP, you should see:
- ✅ "OTP sent successfully to your@email.com"
- ❌ NOT "OTP: 123456 (Email not configured)"

## Troubleshooting

### Still seeing "Email not configured"?

1. **Check `.env` file exists** in `server/` directory
2. **Verify credentials** are correct (no typos)
3. **Restart server** after changing `.env`
4. **Check file location**: Should be `server/.env` not `server/.env.example`

### Email not received?

1. **Check spam/junk folder**
2. **Verify email address** is correct in database
3. **Check server console** for email errors
4. **Verify App Password** is correct (not regular password)
5. **Check Gmail** - sometimes there's a delay

### Authentication errors?

- Make sure you're using **App Password**, not regular password
- Verify **2-Step Verification** is enabled
- Check password has **no spaces** in `.env`

## Example `.env` File

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=library_db
JWT_SECRET=my_secret_key_12345

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myemail@gmail.com
SMTP_PASS=abcdefghijklmnop
```

After configuring, the OTP will be sent to the email address you enter in the login form!
