const { sendEmail } = require('../services/email.service');

/**
 * Handle Contact Form Submission
 */
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 1. Send email to Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@tryscan.in';
    const adminContent = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `New Inquiry: ${subject}`,
      html: adminContent,
      text: `New Contact Submission\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
    });

    // 2. Send confirmation to the User (Optional but good UX)
    const userContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1B4F72;">Hello ${name}!</h2>
        <p>Thank you for reaching out to <strong>TryScan</strong>. We have received your message regarding "${subject}" and our team will get back to you shortly.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 14px; color: #666;">This is an automated confirmation. Please do not reply to this email directly.</p>
        <p style="font-size: 14px; color: #666;">&copy; 2026 TryScan Smart QR System</p>
      </div>
    `;

    // We try to send to user, but don't fail the whole request if this fails
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message — TryScan',
        html: userContent,
        text: `Hello ${name}, thank you for reaching out to TryScan. We have received your message and will get back to you soon.`
      });
    } catch (e) {
      console.warn('Could not send confirmation email to user:', e.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully!' 
    });
  } catch (error) {
    next(error);
  }
};
