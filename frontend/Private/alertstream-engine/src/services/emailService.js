const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SENDGRID_API_KEY || process.env.SMTP_PASSWORD
      }
    });
  }

  async send({ to, subject, html, text, template, data }) {
    try {
      // If template provided, render it
      let emailHtml = html;
      let emailText = text;
      
      if (template && data) {
        const rendered = this.renderTemplate(template, data);
        emailHtml = rendered.html;
        emailText = rendered.text;
      }
      
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'AlertStream <noreply@alertstream.com>',
        to,
        subject,
        html: emailHtml,
        text: emailText
      });
      
      logger.info(`Email sent to ${to}`, { 
        messageId: info.messageId,
        subject 
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Email sending failed to ${to}:`, error);
      throw error;
    }
  }

  renderTemplate(template, data) {
    // Simple template rendering
    const templates = {
      'magic-link': {
        html: `
          <h1>Welcome to AlertStream!</h1>
          <p>Click the link below to complete your setup:</p>
          <a href="${data.magicLink}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Setup
          </a>
          <p>This link expires in ${data.expiresIn || '24 hours'}.</p>
        `,
        text: `Welcome to AlertStream! Complete your setup: ${data.magicLink}`
      },
      'email-setup-instructions': {
        html: `
          <h1>${data.title}</h1>
          <p>Follow these steps to set up email monitoring:</p>
          <ol>
            ${data.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
          ${data.auto_setup_link ? `<a href="${data.auto_setup_link}">Auto-Setup Link</a>` : ''}
        `,
        text: `${data.title}\n\n${data.steps.join('\n')}`
      },
      'support-auto-response': {
        html: `
          <h1>Support Ticket Created</h1>
          <p>Thank you for contacting AlertStream support.</p>
          <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Priority:</strong> ${data.priority}</p>
          <p>Expected response time: ${data.expectedResponseTime} minutes</p>
        `,
        text: `Support Ticket Created\nTicket ID: ${data.ticketId}\nSubject: ${data.subject}`
      },
      'payment-receipt': {
        html: `
          <h1>Payment Receipt</h1>
          <p>Thank you for your payment!</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Invoice ID:</strong> ${data.invoiceId}</p>
        `,
        text: `Payment Receipt\nAmount: $${data.amount}\nDate: ${data.date}`
      },
      'payment-failed': {
        html: `
          <h1>Payment Failed</h1>
          <p>We were unable to process your payment.</p>
          <p>Please update your payment method:</p>
          <a href="${data.updatePaymentUrl}">Update Payment Method</a>
        `,
        text: `Payment Failed. Update your payment method: ${data.updatePaymentUrl}`
      },
      'password-reset': {
        html: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${data.resetUrl}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
        text: `Reset your password: ${data.resetUrl}`
      },
      'billing-info': {
        html: `
          <h1>Billing Information</h1>
          <p><strong>Plan:</strong> ${data.plan?.name || 'Free'}</p>
          <p><strong>Usage:</strong> ${data.usage?.smsUsed || 0} / ${data.usage?.smsLimit || 0} SMS</p>
        `,
        text: `Billing Information\nPlan: ${data.plan?.name || 'Free'}`
      }
    };

    return templates[template] || { html: '', text: '' };
  }

  async verify() {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
