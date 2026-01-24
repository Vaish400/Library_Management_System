# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Database Setup

1. Open MySQL and run:
```bash
mysql -u root -p
```

2. Execute the schema file:
```bash
source database/schema.sql
```

Or manually create the database and tables using the SQL provided in the project description.

### Step 2: Backend Setup

```bash
cd server
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_db
JWT_SECRET=your_super_secret_jwt_key_change_this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

**Important:** See `EMAIL_SETUP.md` for detailed instructions on setting up Gmail App Password or other email providers.

4. Start the server:
```bash
npm start
# or
npm run dev
```

Server will run on `http://localhost:5000`

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Step 4: Create Your First Account

1. Go to `http://localhost:3000/register`
2. Register as Admin or Student
3. Login with OTP (check your email)

## 📧 Email Configuration

**You must configure your own email credentials!**

1. See `EMAIL_SETUP.md` for detailed setup instructions
2. For Gmail: Generate an App Password (not your regular password)
3. Add your credentials to `server/.env` file
4. Never commit `.env` to Git (it's already in `.gitignore`)

## 🎯 Testing the System

### As Admin:
1. Login → Dashboard
2. Add books via "Add Book"
3. View all issued books
4. Manage users

### As Student:
1. Register/Login
2. Browse books
3. Issue books
4. Return books
5. View history

## 🔧 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `library_db` exists

### Email Not Sending
- Check SMTP credentials
- Verify Gmail allows less secure apps
- Check spam folder for OTP emails

### Port Already in Use
- Change PORT in `.env` (backend)
- Change port in `vite.config.js` (frontend)

## 📝 Notes

- OTP expires in 10 minutes
- JWT tokens valid for 7 days
- Books with active issues cannot be deleted
- All passwords are hashed with bcrypt

Happy coding! 🎉
