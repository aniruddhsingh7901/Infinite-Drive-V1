import { Request, Response } from 'express';
import emailService from '../services/emailService';

/**
 * Send an email from the contact form
 */
export const sendContactEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, to } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Set default recipient if not provided
    const recipient = to || 'support@infinitedriven.com';
    
    // Create email subject
    const emailSubject = subject ? `Contact Form: ${subject}` : 'New Contact Form Submission';
    
    // Create email body
    const emailBody = `
Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
This email was sent from the contact form on infinitedriven.com
`;

    // Create HTML version of the email
    const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Contact Form Submission</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
    </tr>
    ${subject ? `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${subject}</td>
    </tr>
    ` : ''}
  </table>
  
  <div style="margin-top: 20px;">
    <h3 style="color: #333;">Message:</h3>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
  </div>
  
  <div style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
    This email was sent from the contact form on infinitedriven.com
  </div>
</div>
`;

    // Send the email
    const emailSent = await emailService.sendEmail(recipient, emailSubject, emailBody, htmlBody);

    if (emailSent) {
      // Send an auto-reply to the user
      const autoReplySubject = 'Thank you for contacting Infinite Drive';
      const autoReplyBody = `
Dear ${name},

Thank you for contacting Infinite Drive. We have received your message and will get back to you as soon as possible, usually within 24 hours during business days.

For your reference, here is a copy of your message:

${message}

If you have any additional information to provide, please reply to this email.

Best regards,
The Infinite Drive Support Team
`;

      const autoReplyHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Thank you for contacting Infinite Drive</h2>
  
  <p>Dear ${name},</p>
  
  <p>Thank you for contacting Infinite Drive. We have received your message and will get back to you as soon as possible, usually within 24 hours during business days.</p>
  
  <p>For your reference, here is a copy of your message:</p>
  
  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; white-space: pre-wrap;">${message}</div>
  
  <p>If you have any additional information to provide, please reply to this email.</p>
  
  <p>
    Best regards,<br>
    The Infinite Drive Support Team
  </p>
  
  <div style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
    This is an automated response. Please do not reply to this email.
  </div>
</div>
`;

      await emailService.sendEmail(email, autoReplySubject, autoReplyBody, autoReplyHtml);

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending contact email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
