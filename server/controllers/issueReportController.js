const pool = require('../config/db');
const { sendEmail } = require('../config/email');

// Create a general issue/support request
const createIssue = async (req, res) => {
  try {
    const { subject, message, category, urgency } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Create the issue
    const [result] = await pool.execute(
      'INSERT INTO library_issues (user_id, subject, message, category, urgency) VALUES (?, ?, ?, ?, ?)',
      [userId, subject, message, category || 'general', urgency || 'normal']
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
        const urgencyEmoji = {
          low: '🟢',
          normal: '🟡',
          high: '🟠',
          urgent: '🔴'
        };

        await sendEmail(
          admin.email,
          `⚠️ New Library Issue Reported: ${subject}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">⚠️ New Issue Reported</h1>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                <p>Hello ${admin.name},</p>
                <p>A student has reported an issue:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">${subject}</h3>
                  <p style="margin: 0; color: #666;">
                    <strong>Category:</strong> ${category || 'General'} | 
                    <strong>Urgency:</strong> ${urgencyEmoji[urgency || 'normal']} ${urgency || 'Normal'}
                  </p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0 0 5px 0;"><strong>Reported by:</strong> ${user.name} (${user.email})</p>
                  <p style="margin: 0 0 5px 0;"><strong>Description:</strong></p>
                  <p style="margin: 0; color: #555; font-style: italic; white-space: pre-wrap;">${message}</p>
                </div>
                
                <p>Please log in to the Library Management System to review and respond to this issue.</p>
                
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
      message: 'Issue reported successfully',
      issueId: result.insertId
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all issues (admin only)
const getAllIssues = async (req, res) => {
  try {
    const { status, category } = req.query;
    
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
    
    if (status) {
      conditions.push('li.status = ?');
      params.push(status);
    }
    
    if (category) {
      conditions.push('li.category = ?');
      params.push(category);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY li.created_at DESC';
    
    const [issues] = await pool.execute(query, params);
    
    res.json({ issues: issues || [] });
  } catch (error) {
    console.error('Get all issues error:', error);
    // Return empty array on error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ issues: [] });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my issues (student)
const getMyIssues = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const [issues] = await pool.execute(
      `SELECT li.*, a.name as admin_name
       FROM library_issues li
       LEFT JOIN users a ON li.responded_by = a.id
       WHERE li.user_id = ?
       ORDER BY li.created_at DESC`,
      [userId]
    );
    
    res.json({ issues: issues || [] });
  } catch (error) {
    console.error('Get my issues error:', error);
    // Return empty array on error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ issues: [] });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to an issue (admin only)
const respondToIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, adminResponse } = req.body;
    const adminId = req.user.id;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the issue details
    const [issues] = await pool.execute(
      `SELECT li.*, u.name as user_name, u.email as user_email
       FROM library_issues li
       JOIN users u ON li.user_id = u.id
       WHERE li.id = ?`,
      [issueId]
    );

    if (issues.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const issue = issues[0];

    // Update the issue
    await pool.execute(
      `UPDATE library_issues 
       SET status = ?, admin_response = ?, responded_by = ?, responded_at = NOW()
       WHERE id = ?`,
      [status, adminResponse || null, adminId, issueId]
    );

    // Send email notification to student
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
              <p>Your issue has been updated:</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${issue.subject}</h3>
                <p style="margin: 0; color: #666;"><strong>Status:</strong> ${status}</p>
              </div>
              
              ${adminResponse ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0 0 5px 0;"><strong>Admin's Response:</strong></p>
                <p style="margin: 0; color: #555;">"${adminResponse}"</p>
              </div>
              ` : ''}
              
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
      message: `Issue ${status} successfully`,
      status
    });
  } catch (error) {
    console.error('Respond to issue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get issue stats (admin only)
const getIssueStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM library_issues
    `);
    
    res.json({ stats: stats[0] || {} });
  } catch (error) {
    console.error('Get issue stats error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ stats: {} });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  respondToIssue,
  getIssueStats
};
