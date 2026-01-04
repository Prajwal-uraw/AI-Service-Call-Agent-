// Background service worker for AlertStream extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AlertStream extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateCredentials') {
    // Generate API credentials
    const apiKey = 'as_' + generateRandomString(16);
    const siteId = 'site_' + generateRandomString(8);
    
    sendResponse({ apiKey, siteId });
  }
  
  if (request.action === 'saveCredentials') {
    // Save credentials to storage
    chrome.storage.local.set({
      [request.domain]: {
        apiKey: request.apiKey,
        siteId: request.siteId,
        installedAt: new Date().toISOString()
      }
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getCredentials') {
    // Get credentials from storage
    chrome.storage.local.get([request.domain], (result) => {
      sendResponse(result[request.domain] || null);
    });
    return true;
  }
});

// Helper function to generate random string
function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Listen for tab updates to check if AlertStream is installed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const domain = new URL(tab.url).hostname;
      
      // Check if AlertStream is installed on this domain
      chrome.storage.local.get([domain], (result) => {
        if (result[domain]) {
          // Update badge to show installed status
          chrome.action.setBadgeText({ text: '✓', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#48bb78', tabId });
        } else {
          chrome.action.setBadgeText({ text: '', tabId });
        }
      });
    } catch (e) {
      // Invalid URL, ignore
    }
  }
});
