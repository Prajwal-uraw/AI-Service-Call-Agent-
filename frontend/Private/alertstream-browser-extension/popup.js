// Popup script for AlertStream browser extension
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Update UI with site info
  document.getElementById('siteUrl').textContent = new URL(tab.url).hostname;
  document.getElementById('siteName').textContent = tab.title || 'Current Website';
  
  // Get site detection info from content script
  chrome.tabs.sendMessage(tab.id, { action: 'getSiteInfo' }, (response) => {
    if (response) {
      document.getElementById('platformBadge').textContent = response.platform || 'Generic';
      
      // Update install button based on platform
      if (response.platform === 'wordpress') {
        document.getElementById('btnText').textContent = 'Install WordPress Plugin';
      } else if (response.platform === 'shopify') {
        document.getElementById('btnText').textContent = 'Install Shopify App';
      } else {
        document.getElementById('btnText').textContent = 'Add JavaScript Snippet';
      }
    }
  });
  
  // Install button click handler
  document.getElementById('installBtn').addEventListener('click', async () => {
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const statusMessage = document.getElementById('statusMessage');
    
    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    try {
      // Generate API credentials
      const apiKey = 'as_' + Math.random().toString(36).substr(2, 16);
      const siteId = 'site_' + Math.random().toString(36).substr(2, 8);
      
      // Send inject message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'injectScript',
        apiKey: apiKey,
        siteId: siteId,
        endpoint: 'https://api.alertstream.com/v1/js-events'
      }, (response) => {
        if (response && response.success) {
          statusMessage.className = 'status status-success';
          statusMessage.textContent = '✅ AlertStream installed successfully!';
          statusMessage.style.display = 'block';
        } else {
          throw new Error('Installation failed');
        }
      });
      
    } catch (error) {
      statusMessage.className = 'status status-error';
      statusMessage.textContent = '❌ Installation failed. Please try again.';
      statusMessage.style.display = 'block';
    } finally {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });
  
  // Dashboard button click handler
  document.getElementById('viewDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://app.alertstream.com/dashboard' });
  });
});
