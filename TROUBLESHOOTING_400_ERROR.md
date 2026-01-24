# Troubleshooting 400 Bad Request Error

## Common Causes and Solutions

### 1. Missing Required Fields

**Error:** `Title, author, and quantity are required`

**Solution:**
- Make sure all required fields are filled:
  - Title (required)
  - Author (required)
  - Quantity (required, must be a number)
- Language defaults to "English" if not provided
- Description, image, and file are optional

### 2. Database Columns Not Updated

**Error:** `Unknown column 'language'` or similar

**Solution:**
Run the enhanced schema:
```bash
mysql -u root -p
source database/schema_enhanced.sql
```

Or manually add columns:
```sql
USE library_db;
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS file_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS description TEXT NULL,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;
```

### 3. File Upload Issues

**Error:** `Only image files...` or `Only book files...`

**Solution:**
- **Images:** Only jpeg, jpg, png, gif, webp allowed
- **Book Files:** Only pdf, epub, mobi, txt, doc, docx allowed
- Files are optional - you can add books without files
- Check file extensions match allowed types

### 4. File Size Too Large

**Error:** `File too large`

**Solution:**
- Images: Maximum 5MB
- Book files: Maximum 100MB
- Compress files if needed

### 5. Authentication Issues

**Error:** `Access denied` or `401 Unauthorized`

**Solution:**
- Make sure you're logged in as admin
- Check if your token is valid
- Try logging out and logging back in

### 6. FormData Not Sent Correctly

**Error:** `400 Bad Request` with no specific message

**Solution:**
- Make sure you're using `FormData` in the frontend
- Check browser console for detailed error
- Verify Content-Type is `multipart/form-data` (should be set automatically)

## Debugging Steps

### 1. Check Server Logs

Look at your server console for detailed error messages:
```bash
cd server
npm start
# or
npm run dev
```

### 2. Check Browser Console

Open browser DevTools (F12) → Console tab to see detailed error messages

### 3. Check Network Tab

Open browser DevTools → Network tab:
- Find the failed request
- Click on it
- Check "Response" tab for error message
- Check "Headers" tab to see what was sent

### 4. Test with Minimal Data

Try adding a book with only required fields:
- Title: "Test Book"
- Author: "Test Author"
- Quantity: 1
- No image, no file, no description

If this works, the issue is with optional fields.

### 5. Verify Database Schema

```sql
USE library_db;
DESCRIBE books;
```

Should show columns: id, title, author, quantity, language, image_url, file_url, description, etc.

## Quick Fix Checklist

- [ ] All required fields filled (title, author, quantity)
- [ ] Database enhanced schema run
- [ ] Server restarted after changes
- [ ] Logged in as admin
- [ ] File types are correct (if uploading files)
- [ ] File sizes within limits (if uploading files)
- [ ] Check server console for errors
- [ ] Check browser console for errors

## Still Having Issues?

1. **Check the exact error message** in:
   - Server console
   - Browser console
   - Network tab response

2. **Share the error details:**
   - Full error message
   - What fields you're trying to submit
   - Whether you're uploading files
   - Server console output

3. **Try the basic version first:**
   - Add book with only title, author, quantity
   - If that works, add other fields one by one

## Example Working Request

```javascript
// Frontend (AddBook.jsx)
const formData = new FormData();
formData.append('title', 'Test Book');
formData.append('author', 'Test Author');
formData.append('quantity', '5');
formData.append('language', 'English');
formData.append('description', 'Test description');
// Optional:
// formData.append('image', imageFile);
// formData.append('bookFile', bookFile);

await bookAPI.addBook(formData);
```

This should work if everything is set up correctly!
