"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        // Use a more reliable configuration with explicit host, port and timeout settings
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com', // Default to Gmail
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Add timeout settings to prevent hanging connections
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 15000,
            // Disable TLS verification in production to avoid certificate issues
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    async sendEmail(to, subject, body, html) {
        try {
            const mailOptions = {
                from: `"Infinite Drive" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text: body
            };
            if (html) {
                mailOptions.html = html;
            }
            // Set a timeout for the email sending operation
            const sendMailPromise = this.transporter.sendMail(mailOptions);
            // Wait for the email to be sent
            const info = await sendMailPromise;
            console.log(`Email sent successfully to ${to}`);
            return true;
        }
        catch (error) {
            console.error('Email sending failed:', error);
            // Don't throw the error, just return false to indicate failure
            // This prevents the error from breaking the payment flow
            return false;
        }
    }
    async sendDownloadLink(to, downloadLinks, txHash, bookTitle, bonusItems) {
        const subject = `Your Purchase: ${bookTitle} - Download Links`;
        let bodyContent = `
Dear Customer,

Thank you for your purchase of "${bookTitle}"! Your transaction has been successfully processed.

Your download links (valid for 24 hours):
`;
        if (downloadLinks.pdf) {
            bodyContent += `\nPDF Version: ${downloadLinks.pdf}`;
        }
        if (downloadLinks.epub) {
            bodyContent += `\nEPUB Version: ${downloadLinks.epub}`;
        }
        if (bonusItems && bonusItems.length > 0) {
            bodyContent += `\n\nYour Bonus Materials:`;
            bonusItems.forEach(item => {
                bodyContent += `\n${item.name}: ${item.link}`;
            });
        }
        bodyContent += `
    
Transaction Hash: ${txHash}

Note: Each link can only be used once and will expire in 24 hours.

If you have any questions or need assistance, please reply to this email.

Best regards,
The Infinite Drive Team
`;
        return await this.sendEmail(to, subject, bodyContent);
    }
    async sendOrderConfirmation(to, orderDetails) {
        const subject = `Order Confirmation #${orderDetails.orderId}`;
        const body = `
Dear Customer,

Thank you for your order! Your payment of ${orderDetails.amount} ${orderDetails.currency} has been confirmed.

Order Details:
- Order ID: ${orderDetails.orderId}
- Book: ${orderDetails.bookTitle}
- Amount: ${orderDetails.amount} ${orderDetails.currency}
- Transaction Hash: ${orderDetails.txHash}

Your download link will be sent in a separate email shortly.

Best regards,
The Infinite Drive Team
`;
        return await this.sendEmail(to, subject, body);
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map