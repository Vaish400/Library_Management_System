# Deploying Library Management System to Vercel

This guide explains how to deploy the complete Library Management System (frontend + backend) to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A cloud MySQL database (options below)
3. Your code pushed to GitHub

## Step 1: Set Up Cloud MySQL Database

Since Vercel is serverless, you need a cloud-hosted MySQL database. Choose one:

### Option A: PlanetScale (Recommended - Free Tier)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection credentials
4. Use the connection string in your environment variables

### Option B: Railway (Free Tier)
1. Go to [railway.app](https://railway.app)
2. Create a new MySQL service
3. Copy the connection credentials

### Option C: Clever Cloud
1. Go to [clever-cloud.com](https://clever-cloud.com)
2. Create a MySQL addon
3. Get the connection details

After creating the database, run the SQL schema:
```sql
-- Run the contents of database/schema.sql
-- Then run database/schema_enhanced.sql for additional features
```

## Step 2: Deploy the Backend (API Server)

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import your GitHub repository
3. **Important**: Set the Root Directory to `server`
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `PORT` | `5000` |
| `DB_HOST` | Your database host |
| `DB_USER` | Your database username |
| `DB_PASSWORD` | Your database password |
| `DB_NAME` | `library_db` |
| `JWT_SECRET` | A long random secret string |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | Your email app password |

5. Click "Deploy"
6. Note your backend URL (e.g., `https://library-server-xyz.vercel.app`)

## Step 3: Deploy the Frontend (React App)

1. In Vercel, click "Add New Project" again
2. Import the same GitHub repository
3. **Important**: Set the Root Directory to `client`
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend-url.vercel.app/api` |

   Replace `your-backend-url` with the actual backend URL from Step 2.

5. Click "Deploy"
6. Your frontend will be live at the provided URL!

## Step 4: Configure CORS (Important!)

After deployment, update the backend's CORS configuration to allow your frontend domain.

In `server/server.js`, update:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

Then redeploy the backend.

## Environment Variables Summary

### Backend (`server/`)
```env
PORT=5000
DB_HOST=your-cloud-db-host.com
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=library_db
JWT_SECRET=your-super-long-random-secret-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (`client/`)
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

## Important Notes

### File Uploads
Vercel serverless functions have ephemeral storage. For production file uploads, consider:
- **Cloudinary** - Free tier for images
- **AWS S3** - Object storage
- **Vercel Blob** - Vercel's storage solution

### Database Connections
Serverless functions create new database connections per request. Consider using connection pooling or a service like PlanetScale that handles this well.

## Troubleshooting

### "Cannot find module" errors
Make sure all dependencies are in `package.json` and run `npm install`.

### CORS errors
1. Check that `VITE_API_URL` matches your backend URL exactly
2. Ensure CORS is properly configured in `server.js`

### Database connection errors
1. Verify your cloud database is running
2. Check that IP allowlist includes Vercel's IP ranges (or allow all IPs)
3. Verify credentials are correct

### 500 errors
Check Vercel's function logs in the dashboard for detailed error messages.

## Quick Deploy Commands

Once set up, any push to your main branch will automatically redeploy both frontend and backend!

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [PlanetScale Documentation](https://docs.planetscale.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
