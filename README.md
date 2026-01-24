# Library Management System

A modern, full-stack library management system with OTP-based email authentication, built with React and Node.js.

## Features

### 👩‍💼 Admin Features
- Secure OTP-based login
- Add, update, and delete books
- View all issued books
- Manage users (students)
- Dashboard with statistics

### 👨‍🎓 Student Features
- User registration
- Secure OTP-based login
- Browse and search books
- Issue books
- Return books
- View issue history
- Personal dashboard

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Vite
- Modern CSS with gradients and animations

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Nodemailer (SMTP email)
- bcryptjs (password hashing)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Gmail account for SMTP (or configure your own SMTP)

### Database Setup

1. Create the database:
```sql
CREATE DATABASE library_db;
USE library_db;
```

2. Run the SQL schema (provided in the project description)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Then edit `.env` and configure your credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_db
JWT_SECRET=your_super_secret_jwt_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

**📧 Email Setup:** See `EMAIL_SETUP.md` for detailed instructions on configuring Gmail App Password or other email providers.

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
library-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app component
│   └── package.json
│
└── server/                 # Node.js backend
    ├── config/            # Database and email config
    ├── controllers/       # Route controllers
    ├── routes/            # API routes
    ├── middleware/        # Auth middleware
    └── server.js          # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/request-otp` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)

### Books
- `GET /api/books` - Get all books (with search)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Issues
- `POST /api/issues/issue` - Issue a book
- `POST /api/issues/return` - Return a book
- `GET /api/issues/my-books` - Get user's issued books
- `GET /api/issues/all` - Get all issued books (Admin only)

## Security Features

- OTP-based email authentication for secure login
- JWT token-based session management
- Password hashing with bcrypt
- Role-based access control (Admin/Student)
- Protected API routes with middleware

## UI Features

- Modern, responsive design
- Beautiful gradient themes
- Smooth animations and transitions
- Intuitive navigation
- Real-time search functionality
- Mobile-friendly interface

## Notes

- OTP expires after 10 minutes
- JWT tokens expire after 7 days
- Books cannot be deleted if currently issued
- Email service uses Gmail SMTP (configure your own in production)

## License

This project is open source and available for educational purposes.
