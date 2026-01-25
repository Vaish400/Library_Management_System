const pool = require('../config/db');
const { sendEmail } = require('../config/email');

// Validation constants
const VALID_CATEGORIES = ['general', 'technical', 'account', 'book', 'other'];
const VALID_URGENCIES = ['low', 'normal', 'high', 'urgent'];
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 10;

// Helper function to validate and sanitize input
const validateIssueInput = (subject, message, category, urgency) => {
  const errors = [];

  // Validate subject
  if (!subject || typeof subject !== 'string') {
    errors.push('Subject is required');
  } else {
    const trimmedSubject = subject.trim();
    if (trimmedSubject.length === 0) {
      errors.push('Subject cannot be empty');
    } else if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
      errors.push(`Subject must be less than ${MAX_SUBJECT_LENGTH} characters`);
    }
  }

  // Validate message
  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
  } else {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      errors.push(`Message must be at least ${MIN_MESSAGE_LENGTH} characters`);
    } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      errors.push(`Message must be less than ${MAX_MESSAGE_LENGTH} characters`);
    }
  }

  // Validate category
  if (category && !VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate urgency
  if (urgency && !VALID_URGENCIES.includes(urgency)) {
    errors.push(`Invalid urgency. Must be one of: ${VALID_URGENCIES.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      subject: subject ? subject.trim() : '',
      message: message ? message.trim() : '',
      category: VALID_CATEGORIES.includes(category) ? category : 'general',
      urgency: VALID_URGENCIES.includes(urgency) ? urgency : 'normal'
    }
  };
};

// Create a general issue/support request
const createIssue = async (req, res) => {
  try {
    const { subject, message, category, urgency } = req.body;
    const userId = req.user?.id;

    // Authentication check
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // Validate input
    const validation = validateIssueInput(subject, message, category, urgency);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { sanitized } = validation;

    // Check if table exists
    try {
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'library_issues'`
      );

      if (tables.length === 0) {
        return res.status(503).json({ 
          success: false,
          message: 'Issue reporting system not available. Please contact administrator.' 
        });
      }
    } catch (dbError) {
      console.error('Database check error:', dbError);
      return res.status(503).json({ 
        success: false,
        message: 'Database service unavailable' 
      });
    }

    // Create the issue
    const [result] = await pool.execute(
      'INSERT INTO library_issues (user_id, subject, message, category, urgency) VALUES (?, ?, ?, ?, ?)',
      [userId, sanitized.subject, sanitized.message, sanitized.category, sanitized.urgency]
    );

    // Get user info for email
    const [users] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const user = users[0];

    // Get admin emails to notify
    const [admins] = await pool.execute(
      'SELECT email, name FROM users WHERE role = "admin"'
    );

    // Send email notification to all admins (non-blocking)
    const emailPromises = admins.map(async (admin) => {
      try {
        const urgencyEmoji = {
          low: '🟢',
          normal: '🟡',
          high: '🟠',
          urgent: '🔴'
        };

        const urgencyLabels = {
          low: 'Low',
          normal: 'Normal',
          high: 'High',
          urgent: 'Urgent'
        };

        const categoryLabels = {
          general: 'General',
          technical: 'Technical',
          account: 'Account',
          book: 'Book Related',
          other: 'Other'
        };

        await sendEmail(
          admin.email,
          `⚠️ New Library Issue Reported: ${sanitized.subject}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">⚠️ New Issue Reported</h1>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                <p>Hello ${admin.name},</p>
                <p>A student has reported an issue that requires your attention:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">${sanitized.subject}</h3>
                  <p style="margin: 0; color: #666;">
                    <strong>Category:</strong> ${categoryLabels[sanitized.category]} | 
                    <strong>Urgency:</strong> ${urgencyEmoji[sanitized.urgency]} ${urgencyLabels[sanitized.urgency]}
                  </p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0 0 5px 0;"><strong>Reported by:</strong> ${user.name} (${user.email})</p>
                  <p style="margin: 0 0 5px 0;"><strong>Description:</strong></p>
                  <p style="margin: 0; color: #555; font-style: italic; white-space: pre-wrap;">${sanitized.message}</p>
                </div>
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-issues" 
                     style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    View Issue in Dashboard
                  </a>
                </p>
                
                <p style="color: #888; font-size: 12px; margin-top: 20px;">
                  This is an automated notification from the Library Management System.
                </p>
              </div>
            </div>
          `
        );
      } catch (emailError) {
        console.error(`Failed to send email to admin ${admin.email}:`, emailError.message);
        // Don't throw - continue with other admins
      }
    });

    // Don't wait for emails - send response immediately
    Promise.all(emailPromises).catch(err => {
      console.error('Error sending notification emails:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully. Admin will be notified via email.',
      data: {
        issueId: result.insertId,
        subject: sanitized.subject,
        status: 'open'
      }
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create issue. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all issues (admin only)
const getAllIssues = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    // Validate status filter
    if (status && !VALID_STATUSES.includes(status) && status !== 'all') {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}, or 'all'` 
      });
    }

    // Validate category filter
    if (category && !VALID_CATEGORIES.includes(category) && category !== 'all') {
      return res.status(400).json({ 
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}, or 'all'` 
      });
    }
    
    // Check if table exists
    try {
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'library_issues'`
      );

      if (tables.length === 0) {
        return res.json({ 
          success: true,
          issues: [] 
        });
      }
    } catch (dbError) {
      console.error('Database check error:', dbError);
      return res.status(503).json({ 
        success: false,
        message: 'Database service unavailable' 
      });
    }
    
    let query = `
      SELECT li.*, 
             u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM library_issues li
      JOIN users u ON li.user_id = u.id
      LEFT JOIN users a ON li.responded_by = a.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push('li.status = ?');
      params.push(status);
    }
    
    if (category && category !== 'all') {
      conditions.push('li.category = ?');
      params.push(category);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY 
      CASE li.urgency 
        WHEN "urgent" THEN 1 
        WHEN "high" THEN 2 
        WHEN "normal" THEN 3 
        WHEN "low" THEN 4 
      END ASC,
      li.created_at DESC';
    
    const [issues] = await pool.execute(query, params);
    
    res.json({ 
      success: true,
      issues: issues || [],
      count: issues?.length || 0
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ 
        success: true,
        issues: [] 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch issues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get my issues (student)
const getMyIssues = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    // Check if table exists
    try {
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'library_issues'`
      );

      if (tables.length === 0) {
        return res.json({ 
          success: true,
          issues: [] 
        });
      }
    } catch (dbError) {
      console.error('Database check error:', dbError);
      return res.status(503).json({ 
        success: false,
        message: 'Database service unavailable' 
      });
    }
    
    const [issues] = await pool.execute(
      `SELECT li.*, a.name as admin_name
       FROM library_issues li
       LEFT JOIN users a ON li.responded_by = a.id
       WHERE li.user_id = ?
       ORDER BY 
         CASE li.urgency 
           WHEN "urgent" THEN 1 
           WHEN "high" THEN 2 
           WHEN "normal" THEN 3 
           WHEN "low" THEN 4 
         END ASC,
         li.created_at DESC`,
      [userId]
    );
    
    res.json({ 
      success: true,
      issues: issues || [],
      count: issues?.length || 0
    });
  } catch (error) {
    console.error('Get my issues error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ 
        success: true,
        issues: [] 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch your issues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Respond to an issue (admin only)
const respondToIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, adminResponse } = req.body;
    const adminId = req.user?.id;

    // Authentication check
    if (!adminId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // Validate issueId
    const issueIdNum = parseInt(issueId);
    if (isNaN(issueIdNum) || issueIdNum <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid issue ID' 
      });
    }

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }

    // Validate adminResponse length if provided
    if (adminResponse && typeof adminResponse === 'string') {
      const trimmedResponse = adminResponse.trim();
      if (trimmedResponse.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ 
          success: false,
          message: `Admin response must be less than ${MAX_MESSAGE_LENGTH} characters` 
        });
      }
    }

    // Get the issue details
    const [issues] = await pool.execute(
      `SELECT li.*, u.name as user_name, u.email as user_email
       FROM library_issues li
       JOIN users u ON li.user_id = u.id
       WHERE li.id = ?`,
      [issueIdNum]
    );

    if (issues.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    const issue = issues[0];

    // Validate status transition (can't reopen closed issues)
    if (issue.status === 'closed' && status !== 'closed') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change status of a closed issue' 
      });
    }

    // Update the issue
    const sanitizedResponse = adminResponse ? adminResponse.trim() : null;
    await pool.execute(
      `UPDATE library_issues 
       SET status = ?, admin_response = ?, responded_by = ?, responded_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [status, sanitizedResponse, adminId, issueIdNum]
    );

    // Send email notification to student (non-blocking)
    const statusLabels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };

    const statusColors = {
      open: '#ef4444',
      in_progress: '#f59e0b',
      resolved: '#10b981',
      closed: '#6b7280'
    };

    try {
      await sendEmail(
        issue.user_email,
        `📧 Issue Update: ${issue.subject}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">📧 Issue Update</h1>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
              <p>Hello ${issue.user_name},</p>
              <p>Your reported issue has been updated by the administrator:</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${statusColors[status]}">
                <h3 style="margin: 0 0 10px 0; color: #333;">${issue.subject}</h3>
                <p style="margin: 0; color: #666;"><strong>New Status:</strong> ${statusLabels[status]}</p>
              </div>
              
              ${sanitizedResponse ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0 0 5px 0;"><strong>Admin's Response:</strong></p>
                <p style="margin: 0; color: #555; white-space: pre-wrap;">${sanitizedResponse}</p>
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-issues" 
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Issue Details
                </a>
              </p>
              
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                This is an automated notification from the Library Management System.
              </p>
            </div>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send email to student:', emailError.message);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Issue updated to ${statusLabels[status]} successfully. Student has been notified.`,
      data: {
        issueId: issueIdNum,
        status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Respond to issue error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update issue. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get issue stats (admin only)
const getIssueStats = async (req, res) => {
  try {
    // Check if table exists
    try {
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'library_issues'`
      );

      if (tables.length === 0) {
        return res.json({ 
          success: true,
          stats: {
            total: 0,
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0
          }
        });
      }
    } catch (dbError) {
      console.error('Database check error:', dbError);
      return res.status(503).json({ 
        success: false,
        message: 'Database service unavailable' 
      });
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN urgency = 'urgent' AND status IN ('open', 'in_progress') THEN 1 ELSE 0 END) as urgent_pending
      FROM library_issues
    `);
    
    res.json({ 
      success: true,
      stats: stats[0] || {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        urgent_pending: 0
      }
    });
  } catch (error) {
    console.error('Get issue stats error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ 
        success: true,
        stats: {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          urgent_pending: 0
        }
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  respondToIssue,
  getIssueStats
};
