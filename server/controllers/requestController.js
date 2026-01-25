const pool = require('../config/db');
const { sendEmail } = require('../config/email');

// Create a book request (student)
const createRequest = async (req, res) => {
  try {
    const { bookId, message } = req.body;
    const userId = req.user.id;

    if (!bookId || !message) {
      return res.status(400).json({ message: 'Book ID and message are required' });
    }

    // Check if book exists
    const [books] = await pool.execute(
      'SELECT id, title, author FROM books WHERE id = ?',
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];

    // Check if user already has a pending request for this book
    const [existingRequests] = await pool.execute(
      'SELECT id FROM book_requests WHERE user_id = ? AND book_id = ? AND status = "pending"',
      [userId, bookId]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    // Create the request
    const [result] = await pool.execute(
      'INSERT INTO book_requests (user_id, book_id, message) VALUES (?, ?, ?)',
      [userId, bookId, message]
    );

    // Get user info for email
    const [users] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );
    const user = users[0];

    // Get admin emails to notify
    const [admins] = await pool.execute(
      'SELECT email, name FROM users WHERE role = "admin"'
    );

    // Send email notification to all admins
    for (const admin of admins) {
      try {
        await sendEmail(
          admin.email,
          `📚 New Book Request: ${book.title}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">📚 New Book Request</h1>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                <p>Hello ${admin.name},</p>
                <p>A student has requested a book from the library:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">${book.title}</h3>
                  <p style="margin: 0; color: #666;">by ${book.author}</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0 0 5px 0;"><strong>Requested by:</strong> ${user.name} (${user.email})</p>
                  <p style="margin: 0 0 5px 0;"><strong>Message:</strong></p>
                  <p style="margin: 0; color: #555; font-style: italic;">"${message}"</p>
                </div>
                
                <p>Please log in to the Library Management System to review and respond to this request.</p>
                
                <p style="color: #888; font-size: 12px; margin-top: 20px;">
                  This is an automated notification from the Library Management System.
                </p>
              </div>
            </div>
          `
        );
      } catch (emailError) {
        console.error('Failed to send email to admin:', emailError.message);
      }
    }

    res.status(201).json({
      message: 'Request submitted successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all requests (admin only)
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT br.*, 
             b.title as book_title, b.author as book_author, b.image_url as book_image,
             u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM book_requests br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
      LEFT JOIN users a ON br.responded_by = a.id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE br.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY br.created_at DESC';
    
    const [requests] = await pool.execute(query, params);
    
    res.json({ requests });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my requests (student)
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    try {
      const [requests] = await pool.execute(
        `SELECT br.*, 
                b.title as book_title, b.author as book_author, b.image_url as book_image,
                a.name as admin_name
         FROM book_requests br
         JOIN books b ON br.book_id = b.id
         LEFT JOIN users a ON br.responded_by = a.id
         WHERE br.user_id = ?
         ORDER BY br.created_at DESC`,
        [userId]
      );
      
      res.json({ requests: requests || [] });
    } catch (dbError) {
      // If table doesn't exist, return empty array
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        console.warn('book_requests table does not exist. Please run create_database.sql');
        return res.json({ requests: [] });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Respond to a request (admin only)
const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminResponse } = req.body;
    const adminId = req.user.id;

    if (!['approved', 'rejected', 'fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved, rejected, or fulfilled' });
    }

    // Get the request details
    const [requests] = await pool.execute(
      `SELECT br.*, u.name as user_name, u.email as user_email, b.title as book_title, b.author as book_author
       FROM book_requests br
       JOIN users u ON br.user_id = u.id
       JOIN books b ON br.book_id = b.id
       WHERE br.id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been responded to' });
    }

    // Update the request
    await pool.execute(
      `UPDATE book_requests 
       SET status = ?, admin_response = ?, responded_by = ?, responded_at = NOW()
       WHERE id = ?`,
      [status, adminResponse || null, adminId, requestId]
    );

    // Send email notification to student
    try {
      const statusEmoji = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '📦';
      const statusText = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Fulfilled';
      
      await sendEmail(
        request.user_email,
        `${statusEmoji} Book Request ${statusText}: ${request.book_title}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, ${status === 'rejected' ? '#e74c3c, #c0392b' : '#27ae60, #2ecc71'}); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">${statusEmoji} Request ${statusText}</h1>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
              <p>Hello ${request.user_name},</p>
              <p>Your book request has been <strong>${statusText.toLowerCase()}</strong>:</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${status === 'rejected' ? '#e74c3c' : '#27ae60'};">
                <h3 style="margin: 0 0 10px 0; color: #333;">${request.book_title}</h3>
                <p style="margin: 0; color: #666;">by ${request.book_author}</p>
              </div>
              
              ${adminResponse ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0 0 5px 0;"><strong>Admin's Response:</strong></p>
                <p style="margin: 0; color: #555;">"${adminResponse}"</p>
              </div>
              ` : ''}
              
              ${status === 'approved' ? `
              <p>The book will be made available for you soon. Please check the library for updates.</p>
              ` : status === 'fulfilled' ? `
              <p>The book is now available! You can issue it from the library.</p>
              ` : `
              <p>We apologize that we couldn't fulfill your request at this time.</p>
              `}
              
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                This is an automated notification from the Library Management System.
              </p>
            </div>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send email to student:', emailError.message);
    }

    res.json({
      message: `Request ${status} successfully`,
      status
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get request stats (admin only)
const getRequestStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled
      FROM book_requests
    `);
    
    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  respondToRequest,
  getRequestStats
};
