// LinkedIn event detector (runs on LinkedIn pages)
(function() {
  console.log('AlertStream LinkedIn Monitor Active');
  
  // Detect profile views
  function detectProfileViews() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Look for "Who's viewed your profile" section
        if (mutation.target.innerText.includes('viewed your profile')) {
          const viewers = extractViewerInfo();
          viewers.forEach(viewer => {
            sendEvent('profile_view', viewer);
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  // Detect new messages
  function detectMessages() {
    // Monitor message badge
    const messageBadge = document.querySelector('[data-test-global-header-messaging]');
    if (messageBadge) {
      const badgeObserver = new MutationObserver(() => {
        const count = getUnreadMessageCount();
        if (count > 0) {
          // New message detected
          extractLatestMessage();
        }
      });
      
      badgeObserver.observe(messageBadge, { attributes: true });
    }
  }
  
  // Extract viewer info from LinkedIn
  function extractViewerInfo() {
    const viewers = [];
    
    // This would parse LinkedIn's DOM structure
    // For demo, we'll simulate
    const viewerElements = document.querySelectorAll('.pv-profile-viewer');
    
    viewerElements.forEach(el => {
      const name = el.querySelector('.name')?.innerText;
      const title = el.querySelector('.title')?.innerText;
      
      if (name) {
        viewers.push({
          viewerName: name,
          viewerTitle: title || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return viewers;
  }
  
  function getUnreadMessageCount() {
    const badge = document.querySelector('.msg-overlay-bubble-header__badge');
    if (badge) {
      return parseInt(badge.textContent) || 0;
    }
    return 0;
  }
  
  function extractLatestMessage() {
    // Navigate to messages and extract latest
    // This would require user interaction or be done in background
    return {
      sender: 'John Doe',
      preview: 'Hi, I saw your profile...',
      timestamp: new Date().toISOString()
    };
  }
  
  function sendEvent(type, data) {
    chrome.runtime.sendMessage({
      type: 'linkedin_event',
      data: {
        type,
        ...data,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Detect connection requests
  function detectConnectionRequests() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const connectionCards = document.querySelectorAll('.invitation-card');
        connectionCards.forEach(card => {
          const name = card.querySelector('.invitation-card__title')?.innerText;
          const title = card.querySelector('.invitation-card__subtitle')?.innerText;
          
          if (name && !card.dataset.alertstreamProcessed) {
            card.dataset.alertstreamProcessed = 'true';
            sendEvent('connection_request', {
              requester: name,
              requesterTitle: title || 'Unknown'
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Detect mentions in posts
  function detectMentions() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const posts = document.querySelectorAll('.feed-shared-update-v2');
        posts.forEach(post => {
          const mentions = post.querySelectorAll('.feed-shared-actor__name');
          mentions.forEach(mention => {
            if (mention.innerText.includes('@you')) {
              const mentioner = post.querySelector('.feed-shared-actor__name')?.innerText;
              const postText = post.querySelector('.feed-shared-text')?.innerText;
              
              sendEvent('mention', {
                mentioner,
                postText: postText?.substring(0, 200) || ''
              });
            }
          });
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Start monitoring
  detectProfileViews();
  detectMessages();
  detectConnectionRequests();
  detectMentions();
  
  console.log('LinkedIn monitoring started');
})();
