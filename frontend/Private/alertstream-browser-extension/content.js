// Detect website platform and forms
class SiteDetector {
  constructor() {
    this.detectedPlatform = null;
    this.detectedForms = [];
    this.detectedEcommerce = false;
  }
  
  detectPlatform() {
    // Check for WordPress
    if (typeof wp !== 'undefined') {
      this.detectedPlatform = 'wordpress';
    }
    // Check for Shopify
    else if (typeof Shopify !== 'undefined') {
      this.detectedPlatform = 'shopify';
    }
    // Check for WooCommerce
    else if (typeof wc !== 'undefined') {
      this.detectedPlatform = 'woocommerce';
    }
    // Check for common CMS
    else {
      this.detectedPlatform = this.detectByMetaTags();
    }
    
    return this.detectedPlatform;
  }
  
  detectByMetaTags() {
    const metaTags = document.getElementsByTagName('meta');
    for (let tag of metaTags) {
      if (tag.getAttribute('name') === 'generator') {
        const content = tag.getAttribute('content').toLowerCase();
        if (content.includes('wordpress')) return 'wordpress';
        if (content.includes('shopify')) return 'shopify';
        if (content.includes('wix')) return 'wix';
        if (content.includes('squarespace')) return 'squarespace';
      }
    }
    return 'generic';
  }
  
  detectForms() {
    const forms = document.querySelectorAll('form');
    this.detectedForms = Array.from(forms).map(form => ({
      id: form.id || 'unnamed',
      action: form.action,
      method: form.method,
      fields: this.extractFormFields(form)
    }));
    return this.detectedForms;
  }
  
  extractFormFields(form) {
    const fields = [];
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.type !== 'hidden' && input.name) {
        fields.push({
          name: input.name,
          type: input.type,
          label: this.findLabel(input)
        });
      }
    });
    
    return fields;
  }
  
  findLabel(input) {
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    return input.placeholder || input.name;
  }
  
  detectEcommerce() {
    // Look for e-commerce indicators
    const indicators = [
      'add to cart',
      'buy now',
      'checkout',
      '$',
      'product',
      'shop'
    ];
    
    const html = document.body.innerHTML.toLowerCase();
    this.detectedEcommerce = indicators.some(indicator => 
      html.includes(indicator)
    );
    
    return this.detectedEcommerce;
  }
  
  generateInstallationPlan() {
    return {
      platform: this.detectedPlatform,
      forms: this.detectedForms,
      has_ecommerce: this.detectedEcommerce,
      recommended_events: this.getRecommendedEvents(),
      installation_method: this.getInstallationMethod()
    };
  }
  
  getRecommendedEvents() {
    const events = [];
    
    if (this.detectedForms.length > 0) {
      events.push('form_submit');
    }
    
    if (this.detectedEcommerce) {
      events.push('order_created');
      events.push('add_to_cart');
    }
    
    // Always track page views
    events.push('page_view');
    
    return events;
  }
  
  getInstallationMethod() {
    const methods = {
      'wordpress': 'plugin',
      'shopify': 'app',
      'generic': 'javascript'
    };
    return methods[this.detectedPlatform] || 'javascript';
  }
}

// Initialize detector
const detector = new SiteDetector();
detector.detectPlatform();
detector.detectForms();
detector.detectEcommerce();

// Send detection results to popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSiteInfo') {
    sendResponse({
      url: window.location.href,
      domain: window.location.hostname,
      platform: detector.detectedPlatform,
      forms: detector.detectedForms.length,
      ecommerce: detector.detectedEcommerce,
      installation_plan: detector.generateInstallationPlan()
    });
  }
  
  if (request.action === 'injectScript') {
    // Inject AlertStream script
    const script = document.createElement('script');
    script.src = 'https://cdn.alertstream.com/alertstream.min.js';
    script.async = true;
    
    const configScript = document.createElement('script');
    configScript.textContent = `
      window.alertstreamConfig = {
        apiKey: '${request.apiKey}',
        siteId: '${request.siteId}',
        endpoint: '${request.endpoint}',
        autoTrackForms: true,
        autoTrackClicks: true
      };
    `;
    
    document.head.appendChild(configScript);
    document.head.appendChild(script);
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});
