const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails using Nodemailer.
 * Configure SMTP settings in .env
 */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, html, text)
 */
const sendEmail = async (options) => {
  // If no credentials, just log it (development mode)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n📧 [EMAIL SERVICE - DEV MODE] Email would be sent with:');
    console.log(`   To:      ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   Content: ${options.text || 'HTML Content'}\n`);
    return { success: true, message: 'Email logged (Dev Mode)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"TableTap Contact" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
