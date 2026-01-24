# Enhanced Features Setup Guide

## 🎉 New Features Added

1. **Book Languages** - Add language field when creating/editing books
2. **Book Images** - Upload cover images for books
3. **Book Downloads** - Upload and download book files (PDF, EPUB, etc.)
4. **Rating System** - Rate books from 1-5 stars
5. **Comments/Reviews** - Add comments and reviews for books
6. **Book Details Page** - Detailed view with image, download, ratings, and comments

## 📋 Setup Instructions

### Step 1: Update Database

Run the enhanced schema to add new tables and columns:

```bash
mysql -u root -p
```

Then:
```sql
source database/schema_enhanced.sql
```

Or manually run:
```sql
USE library_db;

-- Add new columns to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS file_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS description TEXT NULL,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;

-- Create ratings table
CREATE TABLE IF NOT EXISTS book_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book_rating (user_id, book_id),
  INDEX idx_book_id (book_id),
  INDEX idx_user_id (user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS book_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_book_id (book_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### Step 2: Install New Dependencies

```bash
cd server
npm install multer
```

### Step 3: Create Upload Directories

The server will automatically create these directories, but you can create them manually:

```bash
mkdir -p server/uploads/images
mkdir -p server/uploads/books
```

### Step 4: Restart Server

```bash
cd server
npm start
# or
npm run dev
```

## 🎯 How to Use

### For Admins:

1. **Add Book with Image and File:**
   - Go to "Add Book"
   - Fill in title, author, quantity
   - Select language from dropdown
   - Add description (optional)
   - Upload book cover image (optional)
   - Upload book file - PDF, EPUB, etc. (optional)
   - Click "Add Book"

2. **Edit Existing Books:**
   - Go to Books page
   - Click edit icon on any book
   - Update fields including uploading new image/file

### For Students:

1. **View Book Details:**
   - Click on any book card to view details
   - See book image, description, language
   - View average rating and number of ratings

2. **Rate Books:**
   - Go to book details page
   - Click on stars to rate (1-5 stars)
   - Your rating will be saved

3. **Comment on Books:**
   - Go to book details page
   - Scroll to comments section
   - Write your comment and click "Post Comment"
   - Edit/delete your own comments

4. **Download Books:**
   - Go to book details page
   - Click "📥 Download Book" button
   - Book file will open in new tab/download

## 📁 File Storage

- **Images:** Stored in `server/uploads/images/`
- **Book Files:** Stored in `server/uploads/books/`
- Files are served at `/uploads/images/` and `/uploads/books/`

## 🔒 Security Notes

- Only admins can upload files
- Students can download books if file is available
- Users can only edit/delete their own comments
- Admins can delete any comment
- File size limits:
  - Images: 5MB max
  - Book files: 100MB max

## 🐛 Troubleshooting

### Images not showing
- Check if `server/uploads/images/` directory exists
- Verify file was uploaded successfully
- Check browser console for errors
- Ensure server is serving static files from `/uploads`

### Downloads not working
- Verify book file was uploaded
- Check file permissions
- Ensure file URL is correct in database
- Check server logs for errors

### Ratings/Comments not saving
- Check if database tables exist
- Verify user is logged in
- Check browser console for API errors
- Verify backend routes are working

## 📝 API Endpoints

### Ratings
- `POST /api/ratings` - Add/update rating
- `GET /api/ratings/book/:bookId` - Get all ratings for a book
- `GET /api/ratings/book/:bookId/user` - Get user's rating

### Comments
- `POST /api/comments` - Add comment
- `GET /api/comments/book/:bookId` - Get all comments for a book
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Books (Updated)
- `POST /api/books` - Now accepts multipart/form-data with image and bookFile
- `PUT /api/books/:id` - Now accepts multipart/form-data

## 🎨 UI Features

- **Book Cards:** Now show images with hover effects
- **Rating Badge:** Shows average rating on book cards
- **Book Details:** Full page with image, download, ratings, comments
- **Star Rating:** Interactive star rating system
- **Comments Section:** Real-time comments with user info

Enjoy the enhanced library management system! 🚀
