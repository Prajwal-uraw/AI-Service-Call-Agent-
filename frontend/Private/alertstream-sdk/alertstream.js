// alertstream-sdk.js - Full SDK (Loaded by minified snippet)
class AlertStreamSDK {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.siteId = config.siteId;
    this.endpoint = config.endpoint || 'https://api.alertstream.com/v1/events';
    this.queue = [];
    this.initialized = false;
    this.version = '1.0.0';
    
    this.init();
  }
  
  init() {
    // Auto-detect platform
    this.detectPlatform();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Process any queued events
    this.processQueue();
    
    this.initialized = true;
    console.log(`AlertStream SDK v${this.version} initialized`);
  }
  
  detectPlatform() {
    // Detect WordPress
    if (typeof wp !== 'undefined' && wp.heartbeat) {
      this.platform = 'wordpress';
      this.integrationType = 'snippet_wp';
    }
    // Detect Shopify
    else if (typeof Shopify !== 'undefined') {
      this.platform = 'shopify';
      this.integrationType = 'snippet_shopify';
    }
    // Detect WooCommerce
    else if (typeof wc !== 'undefined') {
      this.platform = 'woocommerce';
      this.integrationType = 'snippet_wc';
    }
    // Generic website
    else {
      this.platform = 'generic';
      this.integrationType = 'snippet_js';
    }
  }
  
  setupEventListeners() {
    // Form submissions
    document.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    }, true);
    
    // E-commerce events (if platform detected)
    if (this.platform === 'shopify') {
      this.setupShopifyListeners();
    }
    
    if (this.platform === 'woocommerce') {
      this.setupWooCommerceListeners();
    }
    
    // Page changes (SPA support)
    this.setupSPAListeners();
    
    // Custom event tracking
    document.addEventListener('click', (e) => {
      this.handleCustomEvents(e);
    }, true);
  }
  
  handleFormSubmit(event) {
    const form = event.target;
    const formId = form.id || form.name || 'unknown_form';
    
    // Extract form data
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Don't block form submission
    setTimeout(() => {
      this.track('form_submit', {
        form_id: formId,
        form_action: form.action,
        form_method: form.method,
        fields: data,
        page_url: window.location.href,
        platform: this.platform
      });
    }, 100);
  }
  
  setupShopifyListeners() {
    // Listen for Shopify events
    document.addEventListener('click', (e) => {
      // Detect add to cart
      if (e.target.closest('[data-add-to-cart]') || 
          e.target.closest('[name="add"]')) {
        const product = this.extractProductInfo(e.target);
        this.track('add_to_cart', product);
      }
      
      // Detect checkout initiation
      if (e.target.closest('[href*="/checkout"]') || 
          e.target.closest('[name="checkout"]')) {
        this.track('begin_checkout', {
          page_url: window.location.href
        });
      }
    });
    
    // Listen for Shopify AJAX cart updates
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('/cart/add.js')) {
        // Shopify add to cart AJAX request
        setTimeout(() => {
          window.AlertStream.track('ajax_add_to_cart', {
            url: url
          });
        }, 100);
      }
      return originalFetch.apply(this, args);
    };
  }
  
  setupWooCommerceListeners() {
    // WooCommerce specific events
    if (typeof jQuery !== 'undefined') {
      jQuery(document.body).on('added_to_cart', (event, fragments, cart_hash, $button) => {
        this.track('woocommerce_add_to_cart', {
          product_id: $button.data('product_id'),
          quantity: $button.data('quantity') || 1
        });
      });
      
      jQuery(document.body).on('checkout_error', () => {
        this.track('woocommerce_checkout_error', {
          page_url: window.location.href
        });
      });
    }
  }
  
  setupSPAListeners() {
    // Handle Single Page Applications
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(state, title, url) {
      originalPushState.apply(this, arguments);
      window.dispatchEvent(new CustomEvent('locationchange', { detail: { url } }));
    };
    
    history.replaceState = function(state, title, url) {
      originalReplaceState.apply(this, arguments);
      window.dispatchEvent(new CustomEvent('locationchange', { detail: { url } }));
    };
    
    window.addEventListener('popstate', () => {
      window.dispatchEvent(new CustomEvent('locationchange'));
    });
    
    // Track page views on SPA navigation
    window.addEventListener('locationchange', () => {
      setTimeout(() => {
        this.track('page_view', {
          page_url: window.location.href,
          page_title: document.title,
          referrer: document.referrer
        });
      }, 300);
    });
  }
  
  handleCustomEvents(event) {
    // Check for data attributes
    const element = event.target.closest('[data-alertstream-track]');
    if (element) {
      const eventName = element.getAttribute('data-alertstream-track');
      const eventData = element.getAttribute('data-alertstream-data');
      
      this.track(eventName, eventData ? JSON.parse(eventData) : {});
    }
  }
  
  extractProductInfo(element) {
    const productCard = element.closest('.product-card, .grid-product, [data-product-handle]');
    if (!productCard) return {};
    
    return {
      product_id: productCard.dataset.productId || productCard.id || '',
      product_name: productCard.querySelector('.product-title, .product-name')?.textContent?.trim() || '',
      price: productCard.querySelector('.price, [data-price]')?.textContent?.trim() || '',
      currency: document.querySelector('meta[property="og:price:currency"]')?.content || 'USD'
    };
  }
  
  track(eventName, properties = {}) {
    const event = {
      event_type: eventName,
      site_id: this.siteId,
      timestamp: new Date().toISOString(),
      metadata: {
        ...properties,
        sdk_version: this.version,
        platform: this.platform,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language
      }
    };
    
    if (!this.initialized) {
      this.queue.push(event);
      return;
    }
    
    this.sendEvent(event);
  }
  
  identify(userId, traits = {}) {
    const event = {
      event_type: 'identify',
      site_id: this.siteId,
      timestamp: new Date().toISOString(),
      metadata: {
        user_id: userId,
        traits: traits,
        platform: this.platform
      }
    };
    
    this.sendEvent(event);
  }
  
  page(category, name, properties = {}) {
    const event = {
      event_type: 'page',
      site_id: this.siteId,
      timestamp: new Date().toISOString(),
      metadata: {
        category: category,
        name: name,
        ...properties,
        url: window.location.href,
        referrer: document.referrer
      }
    };
    
    this.sendEvent(event);
  }
  
  sendEvent(event) {
    // Use Beacon API if available (for page unload scenarios)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(event)], {type: 'application/json'});
      navigator.sendBeacon(this.endpoint, blob);
      return;
    }
    
    // Fallback to fetch with low priority
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this._sendFetch(event);
      }, { timeout: 2000 });
    } else {
      setTimeout(() => this._sendFetch(event), 100);
    }
  }
  
  _sendFetch(event) {
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-SDK-Version': this.version
      },
      body: JSON.stringify(event),
      keepalive: true // Keep request alive even if page unloads
    }).catch(error => {
      console.warn('AlertStream: Failed to send event', error);
    });
  }
  
  processQueue() {
    if (this.queue.length > 0) {
      this.queue.forEach(event => this.sendEvent(event));
      this.queue = [];
    }
  }
  
  // Public API methods
  static init(config) {
    if (!window._alertstreamInstance) {
      window._alertstreamInstance = new AlertStreamSDK(config);
    }
    return window._alertstreamInstance;
  }
}

// Initialize if config is present
if (window.alertstreamConfig) {
  AlertStreamSDK.init(window.alertstreamConfig);
}

// Export to window
window.AlertStreamSDK = AlertStreamSDK;

// Support for both new and old API
window.AlertStream = function(method, ...args) {
  const instance = window._alertstreamInstance;
  
  if (!instance && method === 'init') {
    return AlertStreamSDK.init(args[0]);
  }
  
  if (!instance) {
    console.error('AlertStream not initialized. Call AlertStream("init", config) first.');
    return;
  }
  
  if (typeof instance[method] === 'function') {
    return instance[method].apply(instance, args);
  }
};

// Auto-track initial page view
document.addEventListener('DOMContentLoaded', () => {
  if (window._alertstreamInstance) {
    setTimeout(() => {
      window._alertstreamInstance.track('page_view', {
        page_url: window.location.href,
        page_title: document.title
      });
    }, 1000);
  }
});
