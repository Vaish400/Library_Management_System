const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

// Initialize transporter if credentials are available
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const sendOTPEmail = async (recipientEmail, otp, userName = 'User') => {
  // Check if email is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { 
      success: false, 
      error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS in .env file' 
    };
  }

  if (!transporter) {
    return { 
      success: false, 
      error: 'Email transporter not initialized. Please check your SMTP configuration.' 
    };
  }

  console.log(`📧 Preparing to send OTP email to: ${recipientEmail}`);
  console.log(`   User: ${userName}`);
  console.log(`   From: ${process.env.SMTP_USER}`);

  try {
    const mailOptions = {
      from: `"Library Management System" <${process.env.SMTP_USER}>`,
      to: recipientEmail, // Send to the recipient's email address
      subject: 'Your Login OTP - Library Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Library Management System</h1>
            </div>
            <div class="content">
              <h2>Your Login OTP</h2>
              <p>Hello ${userName},</p>
              <p>You have requested to login to the Library Management System. Please use the following OTP to complete your login:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone.
              </div>
              
              <p>If you did not request this OTP, please ignore this email or contact the administrator.</p>
              
              <p>Best regards,<br>Library Management System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${recipientEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipientEmail };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your email and app password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Please check your SMTP settings and internet connection.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Authentication failed. For Gmail, make sure you are using an App Password, not your regular password.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = `Invalid email address: ${recipientEmail}. Please check the recipient email.`;
    }
    return { success: false, error: errorMessage };
  }
};

module.exports = { sendOTPEmail, transporter };
