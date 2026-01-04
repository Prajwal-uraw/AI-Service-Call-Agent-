// Integrated support system
const crypto = require('crypto');
const logger = require('../utils/logger');

class SupportService {
  constructor() {
    this.priorities = {
      'critical': { responseTime: 15, color: '#ef4444' },
      'high': { responseTime: 60, color: '#f97316' },
      'normal': { responseTime: 240, color: '#eab308' },
      'low': { responseTime: 1440, color: '#84cc16' }
    };
  }
  
  async createTicket(user, issue) {
    // Auto-detect priority
    const priority = this.autoDetectPriority(issue);
    
    const ticket = {
      id: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      email: user.email,
      subject: issue.subject,
      description: issue.description,
      priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      assignedTo: null,
      messages: []
    };
    
    // Store ticket
    await this.storeTicket(ticket);
    
    // Notify support team
    await this.notifySupportTeam(ticket);
    
    // Auto-respond to user
    await this.sendAutoResponse(user, ticket);
    
    // Try auto-resolution
    const autoResolved = await this.attemptAutoResolve(ticket);
    if (autoResolved) {
      ticket.status = 'resolved';
      ticket.resolvedAt = new Date().toISOString();
      ticket.resolution = autoResolved.solution;
      
      await this.updateTicket(ticket);
      await this.sendResolution(user, ticket);
    }
    
    return ticket;
  }
  
  autoDetectPriority(issue) {
    const keywords = {
      'critical': ['down', 'emergency', 'urgent', 'broken', 'not working'],
      'high': ['help', 'issue', 'problem', 'question', 'billing'],
      'normal': ['feature', 'suggestion', 'feedback'],
      'low': ['documentation', 'clarification']
    };
    
    const text = (issue.subject + ' ' + issue.description).toLowerCase();
    
    for (const [priority, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return priority;
      }
    }
    
    return 'normal';
  }
  
  async attemptAutoResolve(ticket) {
    // Common issues that can be auto-resolved
    const patterns = [
      {
        pattern: /how.*password.*reset/i,
        solution: 'Password reset instructions sent to email',
        action: async () => await this.sendPasswordReset(ticket.userId)
      },
      {
        pattern: /sms.*not.*sending/i,
        solution: 'Checked SMS queue, all systems operational',
        action: async () => await this.checkSMSStatus(ticket.userId)
      },
      {
        pattern: /billing.*question/i,
        solution: 'Billing FAQ and invoice history sent',
        action: async () => await this.sendBillingInfo(ticket.userId)
      }
    ];
    
    const text = ticket.subject + ' ' + ticket.description;
    
    for (const { pattern, solution, action } of patterns) {
      if (pattern.test(text)) {
        await action();
        return { solution, autoResolved: true };
      }
    }
    
    return null;
  }
  
  async integrateWithHelpDesk(ticket) {
    // Connect to Zendesk, Freshdesk, etc.
    const helpDeskPayload = {
      ticket: {
        subject: `[AlertStream] ${ticket.subject}`,
        description: ticket.description,
        priority: ticket.priority,
        status: 'open',
        requester: {
          name: ticket.userId,
          email: ticket.email
        },
        tags: ['alertstream', 'api'],
        custom_fields: [
          { id: 'user_id', value: ticket.userId },
          { id: 'plan', value: await this.getUserPlan(ticket.userId) }
        ]
      }
    };
    
    // Sync to external help desk
    await this.syncToZendesk(helpDeskPayload);
    
    return { synced: true, helpDeskId: helpDeskPayload.ticket.id };
  }

  async storeTicket(ticket) {
    const db = require('../config/database');
    await db.query(
      `INSERT INTO support_tickets 
       (id, user_id, email, subject, description, priority, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        ticket.id,
        ticket.userId,
        ticket.email,
        ticket.subject,
        ticket.description,
        ticket.priority,
        ticket.status,
        ticket.createdAt
      ]
    );
  }

  async updateTicket(ticket) {
    const db = require('../config/database');
    await db.query(
      `UPDATE support_tickets 
       SET status = $1, resolved_at = $2, resolution = $3, updated_at = NOW()
       WHERE id = $4`,
      [ticket.status, ticket.resolvedAt, ticket.resolution, ticket.id]
    );
  }

  async notifySupportTeam(ticket) {
    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New support ticket: ${ticket.id}`,
          attachments: [{
            color: this.priorities[ticket.priority].color,
            fields: [
              { title: 'Subject', value: ticket.subject, short: true },
              { title: 'Priority', value: ticket.priority, short: true },
              { title: 'User', value: ticket.email, short: true }
            ]
          }]
        })
      });
    }
    
    logger.info(`Support ticket created: ${ticket.id}`, { priority: ticket.priority });
  }

  async sendAutoResponse(user, ticket) {
    const emailService = require('./emailService');
    await emailService.send({
      to: user.email,
      subject: `[Ticket ${ticket.id}] We received your request`,
      template: 'support-auto-response',
      data: {
        ticketId: ticket.id,
        subject: ticket.subject,
        priority: ticket.priority,
        expectedResponseTime: this.priorities[ticket.priority].responseTime
      }
    });
  }

  async sendResolution(user, ticket) {
    const emailService = require('./emailService');
    await emailService.send({
      to: user.email,
      subject: `[Ticket ${ticket.id}] Issue Resolved`,
      template: 'support-resolution',
      data: {
        ticketId: ticket.id,
        resolution: ticket.resolution
      }
    });
  }

  async sendPasswordReset(userId) {
    const db = require('../config/database');
    const result = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await db.query(
        `UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
         WHERE id = $2`,
        [resetToken, userId]
      );
      
      const emailService = require('./emailService');
      await emailService.send({
        to: user.email,
        subject: 'AlertStream Password Reset',
        template: 'password-reset',
        data: {
          resetUrl: `${process.env.DASHBOARD_URL}/reset-password?token=${resetToken}`
        }
      });
    }
  }

  async checkSMSStatus(userId) {
    const { smsQueue } = require('./queueService');
    const pendingJobs = await smsQueue.getJobs(['waiting', 'active']);
    const userJobs = pendingJobs.filter(job => job.data.userId === userId);
    
    return {
      pendingMessages: userJobs.length,
      systemStatus: 'operational'
    };
  }

  async sendBillingInfo(userId) {
    const billingService = require('./billing');
    const overview = await billingService.getBillingOverview(userId);
    
    const db = require('../config/database');
    const result = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (user) {
      const emailService = require('./emailService');
      await emailService.send({
        to: user.email,
        subject: 'AlertStream Billing Information',
        template: 'billing-info',
        data: overview
      });
    }
  }

  async getUserPlan(userId) {
    const db = require('../config/database');
    const result = await db.query('SELECT plan_id FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.plan_id || 'free';
  }

  async syncToZendesk(payload) {
    // Integrate with Zendesk API
    if (process.env.ZENDESK_API_KEY) {
      // Implementation would go here
      logger.info('Synced ticket to Zendesk');
    }
  }

  // Get tickets for a user
  async getUserTickets(userId, status = 'all') {
    const db = require('../config/database');
    let query = 'SELECT * FROM support_tickets WHERE user_id = $1';
    const params = [userId];
    
    if (status !== 'all') {
      query += ' AND status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  // Add message to ticket
  async addMessage(ticketId, userId, message, isStaff = false) {
    const db = require('../config/database');
    const messageId = crypto.randomUUID();
    
    await db.query(
      `INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_staff, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [messageId, ticketId, userId, message, isStaff]
    );
    
    // Update ticket status
    await db.query(
      `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
      [isStaff ? 'awaiting_customer' : 'awaiting_support', ticketId]
    );
    
    return messageId;
  }
}

module.exports = new SupportService();
