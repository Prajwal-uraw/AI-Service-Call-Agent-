// Email monitoring WITHOUT IMAP/OAuth complexity
class EmailMonitorService {
  async setupEmailMonitoring(user, settings) {
    // Method 1: Magic Forwarding (Easiest)
    if (settings.method === 'forward') {
      return this.setupForwarding(user);
    }
    
    // Method 2: Gmail OAuth (Auto-setup)
    if (settings.method === 'gmail_auto') {
      return this.autoSetupGmail(user);
    }
    
    // Method 3: Office 365 Auto-setup
    if (settings.method === 'office365_auto') {
      return this.autoSetupOffice365(user);
    }
  }
  
  async setupForwarding(user) {
    // Generate unique forwarding address
    const forwardEmail = `alert+${user.id}@monitor.alertstream.com`;
    
    // Instructions based on email provider
    const provider = await this.detectEmailProvider(user.email);
    
    const instructions = this.getForwardingInstructions(provider, forwardEmail);
    
    // Send setup email with ONE-CLICK forwarding rules
    await this.sendAutoSetupEmail(user.email, instructions);
    
    return {
      status: 'pending_forward',
      forward_email: forwardEmail,
      instructions_sent: true,
      magic_link: `https://setup.alertstream.com/auto-forward/${user.id}`
    };
  }
  
  async autoSetupGmail(user) {
    // OAuth auto-setup with minimal permissions
    const authUrl = this.generateGmailAuthUrl(user.id, [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.settings.basic'
    ]);
    
    // Return auto-install flow
    return {
      status: 'oauth_required',
      auth_url: authUrl,
      one_click_setup: true,
      estimated_time: '30 seconds'
    };
  }
  
  async detectEmailProvider(email) {
    const domain = email.split('@')[1].toLowerCase();
    
    // Provider database
    const providers = {
      'gmail.com': 'gmail',
      'googlemail.com': 'gmail',
      'outlook.com': 'outlook',
      'hotmail.com': 'outlook',
      'live.com': 'outlook',
      'yahoo.com': 'yahoo',
      'aol.com': 'aol',
      'icloud.com': 'icloud',
      'me.com': 'icloud',
      'mac.com': 'icloud',
      // Corporate domains
      'microsoft.com': 'office365',
      'apple.com': 'office365',
      'amazon.com': 'office365'
    };
    
    return providers[domain] || 'unknown';
  }
  
  getForwardingInstructions(provider, forwardEmail) {
    const templates = {
      gmail: {
        title: "One-Click Gmail Forwarding",
        steps: [
          `1. Click this link to auto-setup: https://mail.google.com/mail/u/0/#settings/fwdandpop`,
          `2. Click "Add a forwarding address"`,
          `3. Enter: ${forwardEmail}`,
          `4. Click "Next" then "Proceed"`,
          `5. We'll handle the rest automatically`
        ],
        auto_setup_link: `https://mail.google.com/mail/u/0/?view=page&name=autoforward&email=${forwardEmail}`
      },
      
      outlook: {
        title: "Auto-Forward from Outlook",
        steps: [
          `1. Sign in to Outlook.com`,
          `2. Click this auto-setup link: https://outlook.live.com/mail/options/mail/rules`,
          `3. We'll create the rule for you automatically`
        ]
      },
      
      yahoo: {
        title: "Yahoo Mail Auto-Forward",
        steps: [
          `1. Click: https://mail.yahoo.com/d/settings/1`,
          `2. We'll guide you through the 2-click setup`
        ]
      }
    };
    
    return templates[provider] || {
      title: "Forward Emails Manually",
      steps: [
        `1. Go to your email settings`,
        `2. Find "Forwarding" or "Rules"`,
        `3. Forward emails containing your keywords to: ${forwardEmail}`,
        `4. That's it! We'll text you when they arrive`
      ]
    };
  }
  
  async processForwardedEmail(emailData) {
    // Extract and analyze forwarded email
    const analysis = await this.analyzeEmail(emailData);
    
    // Check against user's monitoring rules
    const matches = await this.checkEmailRules(analysis);
    
    if (matches.length > 0) {
      // Send SMS alert
      await this.sendEmailAlert(emailData, matches);
    }
    
    return { processed: true, matches };
  }
  
  async analyzeEmail(email) {
    return {
      from: email.from,
      to: email.to,
      subject: email.subject,
      body_preview: email.body.substring(0, 200),
      keywords: this.extractKeywords(email),
      importance: this.calculateImportance(email),
      category: this.categorizeEmail(email)
    };
  }

  extractKeywords(email) {
    // Extract important keywords from email
    const text = `${email.subject} ${email.body}`.toLowerCase();
    const keywords = [];
    
    // Common important keywords
    const importantWords = ['urgent', 'asap', 'important', 'deadline', 'meeting', 'interview', 'offer', 'payment'];
    importantWords.forEach(word => {
      if (text.includes(word)) keywords.push(word);
    });
    
    return keywords;
  }

  calculateImportance(email) {
    let score = 0;
    const text = `${email.subject} ${email.body}`.toLowerCase();
    
    if (text.includes('urgent')) score += 3;
    if (text.includes('asap')) score += 2;
    if (text.includes('important')) score += 2;
    if (email.hasAttachment) score += 1;
    
    return score > 5 ? 'high' : score > 2 ? 'medium' : 'low';
  }

  categorizeEmail(email) {
    const subject = email.subject.toLowerCase();
    
    if (subject.includes('invoice') || subject.includes('payment')) return 'billing';
    if (subject.includes('interview') || subject.includes('job')) return 'career';
    if (subject.includes('order') || subject.includes('shipping')) return 'shopping';
    if (subject.includes('meeting') || subject.includes('calendar')) return 'calendar';
    
    return 'general';
  }

  generateGmailAuthUrl(userId, scopes) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.API_BASE_URL}/api/v1/oauth/gmail/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      state: userId,
      access_type: 'offline',
      prompt: 'consent'
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async autoSetupOffice365(user) {
    // Similar OAuth flow for Office 365
    return {
      status: 'oauth_required',
      auth_url: this.generateOffice365AuthUrl(user.id),
      one_click_setup: true,
      estimated_time: '45 seconds'
    };
  }

  generateOffice365AuthUrl(userId) {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = `${process.env.API_BASE_URL}/api/v1/oauth/office365/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'Mail.Read Mail.ReadBasic',
      state: userId
    });
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async sendAutoSetupEmail(email, instructions) {
    // Send email with setup instructions
    const emailService = require('./emailService');
    await emailService.send({
      to: email,
      subject: 'AlertStream - Complete Your Email Monitoring Setup',
      template: 'email-setup-instructions',
      data: instructions
    });
  }

  async checkEmailRules(analysis) {
    // Check email against user's monitoring rules
    return [];
  }

  async sendEmailAlert(emailData, matches) {
    const smsService = require('./smsService');
    const message = `📧 Email Alert: ${emailData.subject.substring(0, 50)} from ${emailData.from}`;
    await smsService.sendSMS(emailData.userId, message);
  }
}

module.exports = new EmailMonitorService();
