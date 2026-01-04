// Monitor Google searches for specific terms
class GoogleSearchMonitor {
  constructor() {
    this.monitoredTerms = [];
    this.isActive = false;
    this.userId = null;
  }
  
  async startMonitoring(terms) {
    this.monitoredTerms = terms;
    this.isActive = true;
    
    // Listen for Google searches
    chrome.webNavigation.onCompleted.addListener((details) => {
      if (details.url.includes('google.com/search')) {
        this.analyzeSearchPage(details.tabId);
      }
    });
    
    // Also check current tab on startup
    chrome.tabs.query({url: '*://*.google.com/*'}, (tabs) => {
      tabs.forEach(tab => this.analyzeSearchPage(tab.id));
    });
  }
  
  async analyzeSearchPage(tabId) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: this.extractSearchResults,
      args: [this.monitoredTerms]
    }, (results) => {
      if (results && results[0]) {
        this.processSearchResults(results[0].result);
      }
    });
  }
  
  extractSearchResults(monitoredTerms) {
    const searchResults = [];
    
    // Get search query
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    // Get search result elements
    const resultElements = document.querySelectorAll('.g, .rc');
    
    resultElements.forEach((element, index) => {
      const title = element.querySelector('h3')?.innerText;
      const url = element.querySelector('a')?.href;
      const snippet = element.querySelector('.VwiC3b')?.innerText;
      
      if (title && url) {
        // Check if any monitored terms appear
        const containsTerm = monitoredTerms.some(term => 
          title.toLowerCase().includes(term.toLowerCase()) ||
          (snippet && snippet.toLowerCase().includes(term.toLowerCase()))
        );
        
        if (containsTerm) {
          searchResults.push({
            position: index + 1,
            query,
            title,
            url,
            snippet: snippet || '',
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    return {
      query,
      results: searchResults,
      totalResults: resultElements.length
    };
  }
  
  async processSearchResults(data) {
    if (data.results.length > 0) {
      // Send alert for each found term
      data.results.forEach(result => {
        this.sendSearchAlert(result);
      });
    }
  }
  
  async sendSearchAlert(result) {
    const alertMessage = `🔍 Google Search Alert: Your name appears in result #${result.position} for "${result.query}"`;
    
    // Send to backend
    await fetch('https://api.alertstream.com/v1/alerts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': this.userId
      },
      body: JSON.stringify({
        type: 'google_search_mention',
        query: result.query,
        result: result,
        alert_message: alertMessage
      })
    });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Google Search Alert',
      message: alertMessage,
      priority: 1
    });
  }

  stopMonitoring() {
    this.isActive = false;
    this.monitoredTerms = [];
  }

  addTerm(term) {
    if (!this.monitoredTerms.includes(term)) {
      this.monitoredTerms.push(term);
    }
  }

  removeTerm(term) {
    this.monitoredTerms = this.monitoredTerms.filter(t => t !== term);
  }
}

// Export for use in background script
if (typeof module !== 'undefined') {
  module.exports = GoogleSearchMonitor;
}
