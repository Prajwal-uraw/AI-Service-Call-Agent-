// LinkedIn monitoring via browser extension
class LinkedInMonitor {
  constructor() {
    this.isMonitoring = false;
    this.rules = [];
    this.userId = null;
  }
  
  async startMonitoring(rules) {
    this.rules = rules;
    this.isMonitoring = true;
    
    // Listen for LinkedIn page loads
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.url.includes('linkedin.com') && changeInfo.status === 'complete') {
        this.injectLinkedInScript(tabId);
      }
    });
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'linkedin_event') {
        this.handleLinkedInEvent(message.data);
      }
    });
  }
  
  injectLinkedInScript(tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-scripts/linkedin-detector.js']
    });
  }
  
  async handleLinkedInEvent(event) {
    // Check event against rules
    const matches = this.checkRules(event);
    
    if (matches.length > 0) {
      // Send SMS alert
      await this.sendAlert(event, matches);
      
      // Show notification
      this.showDesktopNotification(event);
    }
  }
  
  checkRules(event) {
    return this.rules.filter(rule => {
      switch (rule.type) {
        case 'profile_view':
          return event.type === 'profile_view' && 
                 this.matchesKeywords(event.viewerName, rule.keywords);
        
        case 'message_received':
          return event.type === 'message' && 
                 event.sender &&
                 this.matchesKeywords(event.sender, rule.senders);
        
        case 'connection_request':
          return event.type === 'connection_request' &&
                 this.matchesKeywords(event.requester, rule.keywords);
        
        case 'post_mention':
          return event.type === 'mention' &&
                 event.postText.includes(rule.keywords);
        
        default:
          return false;
      }
    });
  }
  
  matchesKeywords(text, keywords) {
    if (!keywords || keywords.length === 0) return true;
    
    const textLower = text.toLowerCase();
    return keywords.some(keyword => textLower.includes(keyword.toLowerCase()));
  }
  
  async sendAlert(event, matchingRules) {
    const alertMessage = this.formatAlertMessage(event, matchingRules);
    
    // Send to backend
    await fetch('https://api.alertstream.com/v1/alerts/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': this.userId
      },
      body: JSON.stringify({
        event,
        rules: matchingRules,
        alert_message: alertMessage
      })
    });
  }
  
  formatAlertMessage(event, rules) {
    const ruleNames = rules.map(r => r.name).join(', ');
    
    switch (event.type) {
      case 'profile_view':
        return `👀 LinkedIn: ${event.viewerName} viewed your profile (${event.viewerTitle})`;
      
      case 'message':
        return `💬 LinkedIn: New message from ${event.sender}: "${event.preview}"`;
      
      case 'connection_request':
        return `🤝 LinkedIn: Connection request from ${event.requester}`;
      
      case 'mention':
        return `📢 LinkedIn: You were mentioned by ${event.mentioner}`;
      
      default:
        return `🔔 LinkedIn Activity: ${event.type}`;
    }
  }
  
  showDesktopNotification(event) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'LinkedIn Alert',
      message: this.formatAlertMessage(event, []),
      priority: 2
    });
  }
}

// Export for use in background script
if (typeof module !== 'undefined') {
  module.exports = LinkedInMonitor;
}
