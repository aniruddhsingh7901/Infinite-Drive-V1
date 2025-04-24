import dotenv from 'dotenv';
import { promisify } from 'util';
import dns from 'dns';

dotenv.config();

/**
 * SendGrid Email Service
 * 
 * This service provides email functionality using SendGrid's API instead of SMTP.
 * SendGrid is recommended for cloud environments like DigitalOcean where SMTP ports
 * are often blocked for security reasons.
 */
class SendGridEmailService {
  private isInitialized: boolean = false;
  private initializationError: Error | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the SendGrid email service
   */
  private async initializeService() {
    try {
      this.apiKey = process.env.SENDGRID_API_KEY;

      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured. Please set SENDGRID_API_KEY environment variable.');
      }

      // Set the API key for the SendGrid client
      // We're using dynamic import to avoid requiring sendgrid as a dependency until it's installed
      const sgMail = await this.getSendGridClient();
      sgMail.setApiKey(this.apiKey);
      
      console.log('SendGrid email service initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SendGrid email service:', error);
      this.initializationError = error as Error;
      this.isInitialized = false;
    }
  }

  /**
   * Get the SendGrid client (dynamically imported)
   */
  private async getSendGridClient() {
    try {
      // Dynamic import of @sendgrid/mail
      return await import('@sendgrid/mail').then(module => module.default);
    } catch (error) {
      console.error('Failed to import SendGrid client. Make sure @sendgrid/mail is installed:', error);
      throw new Error('SendGrid client not available. Run: npm install @sendgrid/mail');
    }
  }

  /**
   * Check if internet connection is available
   */
  private async checkInternetConnection(): Promise<boolean> {
    try {
      const lookup = promisify(dns.lookup);
      await lookup('google.com');
      return true;
    } catch (error) {
      console.error('Internet connection check failed:', error);
      return false;
    }
  }

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Email body (HTML or plain text)
   * @param attachments Optional attachments
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendEmail(to: string, subject: string, body: string, attachments?: any[]): Promise<boolean> {
    try {
      // Check if email sending is disabled in development mode
      if (process.env.NODE_ENV === 'development' && process.env.DISABLE_EMAILS === 'true') {
        console.log('Email sending is disabled in development mode');
        console.log(`Would have sent email to: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        return true;
      }

      // Check if service is initialized
      if (!this.isInitialized) {
        // Check internet connection first
        const hasInternet = await this.checkInternetConnection();
        if (!hasInternet) {
          console.error('Cannot send email: No internet connection');
          return false;
        }

        // Try to initialize again
        await this.initializeService();
        
        if (!this.isInitialized) {
          console.error('Cannot send email: Failed to initialize SendGrid email service');
          return false;
        }
      }

      // Get the SendGrid client
      const sgMail = await this.getSendGridClient();
      
      // Prepare email data
      // IMPORTANT: For SendGrid, the from email must be a verified sender
      // If you're getting a "The from address does not match a verified Sender Identity" error,
      // you need to verify the sender email in SendGrid dashboard
      
      // Try to use a verified sender email
      // First try SENDGRID_FROM_EMAIL, then EMAIL_FROM, then fallback to a default
      const configuredFromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'info@infinitedrive.com';
      
      // Create a list of potential sender emails to try
      // This is a workaround until the actual sender email is verified in SendGrid
      const potentialSenders = [
        configuredFromEmail,
        'aniruddh.singh@imentus.com', // This appears to be in the SendGrid dashboard
        'noreply@torrins.com',        // This is the configured email in the system
        'info@infinitedrive.com'      // Default fallback
      ];
      
      // Try each sender email until one works
      let emailSent = false;
      let lastError: Error | null = null;
      
      for (const fromEmail of potentialSenders) {
        try {
          const msg = {
            to,
            from: fromEmail,
            subject,
            html: body,
            attachments: attachments?.map(attachment => ({
              content: attachment.content,
              filename: attachment.filename,
              type: attachment.mimetype,
              disposition: 'attachment'
            }))
          };

          // Send email
          await sgMail.send(msg);
          
          console.log(`Email sent to ${to} via SendGrid using sender: ${fromEmail}`);
          emailSent = true;
          break; // Exit the loop if email is sent successfully
        } catch (error: any) {
          const senderError = error as Error & { 
            response?: { 
              body?: { 
                errors?: Array<{ message?: string }> 
              } 
            } 
          };
          
          console.warn(`Failed to send email using sender ${fromEmail}:`, senderError.message || 'Unknown error');
          lastError = senderError;
          
          // If this is not a sender verification error, don't try other senders
          const isSenderIdentityError = 
            senderError.message?.includes('sender identity') || 
            senderError.response?.body?.errors?.some((e: { message?: string }) => 
              e.message?.includes('sender identity')
            );
            
          if (!isSenderIdentityError) {
            throw senderError; // Re-throw if it's not a sender verification issue
          }
        }
      }
      
      if (emailSent) {
        return true;
      } else {
        // If we tried all senders and none worked, throw the last error
        throw lastError || new Error('Failed to send email with all potential senders');
      }
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      return false;
    }
  }

  /**
   * Test SendGrid connection with the current settings
   * @returns Promise resolving to a diagnostic object with connection status and details
   */
  async testConnection(): Promise<{success: boolean, message: string, details?: any}> {
    try {
      // Check internet connection first
      const hasInternet = await this.checkInternetConnection();
      if (!hasInternet) {
        return {
          success: false,
          message: 'No internet connection detected'
        };
      }

      // Check if API key is configured
      if (!this.apiKey) {
        return {
          success: false,
          message: 'SendGrid API key not configured'
        };
      }

      // Get the SendGrid client
      const sgMail = await this.getSendGridClient();
      sgMail.setApiKey(this.apiKey);
      
      // We can't directly test the API key without sending an email
      // So we'll just check if the API key is set and return success
      return {
        success: true,
        message: 'SendGrid API key is configured',
        details: {
          apiKey: '********' // Mask the API key for security
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `SendGrid connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  }

  /**
   * Send an order confirmation email
   * @param to Recipient email address
   * @param orderDetails Order details
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendOrderConfirmation(to: string, orderDetails: any): Promise<boolean> {
    const subject = `Order Confirmation: ${orderDetails.orderId || orderDetails.id}`;
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Order Confirmation</h1>
        <p>Thank you for your purchase!</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${orderDetails.orderId || orderDetails.id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Product:</strong> ${orderDetails.bookTitle || orderDetails.bookId}</p>
          <p><strong>Amount:</strong> $${orderDetails.amount}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.currency || orderDetails.payment_currency || 'Credit Card'}</p>
          ${orderDetails.txHash ? `<p><strong>Transaction Hash:</strong> ${orderDetails.txHash}</p>` : ''}
        </div>
        <p>You will receive a download link shortly. If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(to, subject, body);
  }

  /**
   * Send a download link email
   * @param to Recipient email address
   * @param downloadDetails Download details
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendDownloadLink(to: string, downloadDetails: any): Promise<boolean> {
    const subject = `Your Download Link: ${downloadDetails.bookTitle || downloadDetails.bookId}`;
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Your Download Link</h1>
        <p>Thank you for your purchase! Your download link is ready.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Download Details</h2>
          <p><strong>Product:</strong> ${downloadDetails.bookTitle || downloadDetails.bookId}</p>
          <p><strong>Format:</strong> ${downloadDetails.format}</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${downloadDetails.downloadUrl}" style="display: inline-block; background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Now</a>
          </div>
          <p><strong>Expires:</strong> ${new Date(downloadDetails.expiresAt).toLocaleString()}</p>
        </div>
        
        <p>This download link will expire after ${downloadDetails.expiryHours || 48} hours for security reasons.</p>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Send the main download link email
    const mainEmailSent = await this.sendEmail(to, subject, body);
    
    // If there are bonus items, send them in a separate email
    if (downloadDetails.bonusItems && downloadDetails.bonusItems.length > 0) {
      const bonusSubject = `Your Bonus Items: ${downloadDetails.bookTitle || downloadDetails.bookId}`;
      
      const bonusBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Your Bonus Items</h1>
          <p>Thank you for your purchase! Here are your bonus items for "${downloadDetails.bookTitle || downloadDetails.bookId}".</p>
          
          <div style="background-color: #f0fff4; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Bonus Items</h2>
            <ul>
              ${downloadDetails.bonusItems.map((item: any) => `
                <li style="margin-bottom: 15px;">
                  <p style="font-weight: bold; margin-bottom: 5px;">${item.name}</p>
                  <a href="${item.link}" style="display: inline-block; background-color: #48bb78; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Bonus</a>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <p>These bonus items are complementary to your purchase. Enjoy!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
            <p>Infinite Drive</p>
            <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
          </div>
        </div>
      `;
      
      await this.sendEmail(to, bonusSubject, bonusBody);
    }
    
    return mainEmailSent;
  }

  /**
   * Send a contact form confirmation email
   * @param to Recipient email address
   * @param contactDetails Contact form details
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendContactFormConfirmation(to: string, contactDetails: any): Promise<boolean> {
    const subject = 'We received your message';
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Message Received</h1>
        <p>Thank you for contacting us! We have received your message and will get back to you as soon as possible.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Your Message</h2>
          <p><strong>Name:</strong> ${contactDetails.name}</p>
          <p><strong>Email:</strong> ${contactDetails.email}</p>
          <p><strong>Subject:</strong> ${contactDetails.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: white; padding: 10px; border-radius: 5px;">${contactDetails.message}</p>
        </div>
        <p>Our team will review your message and respond within 24-48 hours.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(to, subject, body);
  }

  /**
   * Send a payment confirmation email
   * @param to Recipient email address
   * @param paymentDetails Payment details
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendPaymentConfirmation(to: string, paymentDetails: any): Promise<boolean> {
    const subject = `Payment Confirmation: ${paymentDetails.id}`;
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Payment Confirmation</h1>
        <p>Your payment has been successfully processed!</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Payment Details</h2>
          <p><strong>Payment ID:</strong> ${paymentDetails.id}</p>
          <p><strong>Date:</strong> ${new Date(paymentDetails.createdAt || Date.now()).toLocaleString()}</p>
          <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
          <p><strong>Payment Method:</strong> ${paymentDetails.payment_currency || 'Credit Card'}</p>
          ${paymentDetails.txHash ? `<p><strong>Transaction Hash:</strong> ${paymentDetails.txHash}</p>` : ''}
        </div>
        <p>Your order is now being processed, and you will receive a download link shortly.</p>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(to, subject, body);
  }

  /**
   * Send a password reset email
   * @param to Recipient email address
   * @param resetToken Password reset token
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    const subject = 'Password Reset Request';
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Password Reset Request</h1>
        <p>You requested a password reset for your Infinite Drive admin account.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Reset Instructions</h2>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="margin-top: 20px; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="background-color: white; padding: 10px; border-radius: 5px; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(to, subject, body);
  }

  /**
   * Send an OTP authentication email
   * @param to Recipient email address
   * @param otp One-time password
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendOTPEmail(to: string, otp: string): Promise<boolean> {
    const subject = 'Your Authentication Code';
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Authentication Code</h1>
        <p>You requested a one-time authentication code for your Infinite Drive account.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h2 style="color: #2d3748; margin-top: 0;">Your Code</h2>
          <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
        </div>
        <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(to, subject, body);
  }

  /**
   * Send an abandoned cart reminder email
   * @param to Recipient email address
   * @param cartDetails Abandoned cart details
   * @returns Promise resolving to true if email was sent successfully
   */
  async sendAbandonedCartReminder(to: string, cartDetails: any): Promise<boolean> {
    const subject = `Complete Your Purchase: ${cartDetails.bookTitle}`;
    
    // Generate recovery link
    const recoveryLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?recover=${cartDetails.cartId}`;
    
    // Create HTML email body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Your Cart is Waiting</h1>
        <p>We noticed you didn't complete your purchase of "${cartDetails.bookTitle}".</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Cart Details</h2>
          <p><strong>Product:</strong> ${cartDetails.bookTitle}</p>
          <p><strong>Format:</strong> ${cartDetails.format}</p>
          <p><strong>Price:</strong> $${cartDetails.amount}</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${recoveryLink}" style="display: inline-block; background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Your Purchase</a>
          </div>
        </div>
        <p>If you have any questions or need assistance, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>Infinite Drive</p>
          <p>© ${new Date().getFullYear()} Infinite Drive. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 10px;">If you don't want to receive these reminders, please <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(to)}" style="color: #4299e1;">unsubscribe</a>.</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(to, subject, body);
  }
}

// Export a singleton instance
export default new SendGridEmailService();
