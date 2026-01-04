// DNS-based auto-discovery and verification
const dns = require('dns').promises;
const crypto = require('crypto');

class DNSAutoSetup {
  async discoverWebsite(email) {
    // Extract domain from email
    const domain = email.split('@')[1];
    
    try {
      // 1. Check for existing AlertStream integration via DNS
      const txtRecords = await dns.resolveTxt(`_alertstream.${domain}`);
      const alertstreamRecord = txtRecords.flat().find(record => 
        record.startsWith('alertstream-')
      );
      
      if (alertstreamRecord) {
        return this.parseDNSRecord(alertstreamRecord);
      }
      
      // 2. Check for common CMS platforms
      const cms = await this.detectCMS(domain);
      
      // 3. Auto-generate setup based on detected platform
      return {
        domain,
        platform: cms,
        setup_method: this.getSetupMethodForCMS(cms),
        verified: false
      };
      
    } catch (error) {
      return { domain, platform: 'unknown', error: 'DNS check failed' };
    }
  }
  
  async detectCMS(domain) {
    // Try to detect CMS by common endpoints
    const endpoints = [
      { path: '/wp-admin', cms: 'wordpress' },
      { path: '/admin', cms: 'shopify' },
      { path: '/wp-json', cms: 'wordpress' },
      { path: '/admin/login', cms: 'generic' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`https://${domain}${endpoint.path}`, {
          method: 'HEAD',
          timeout: 3000
        });
        if (response.ok) {
          return endpoint.cms;
        }
      } catch (e) {
        continue;
      }
    }
    
    return 'unknown';
  }
  
  getSetupMethodForCMS(cms) {
    const methods = {
      'wordpress': 'direct_plugin_install',
      'shopify': 'oauth_app_store',
      'generic': 'javascript_snippet',
      'unknown': 'email_instructions'
    };
    return methods[cms] || 'email_instructions';
  }
  
  async generateTXTRecord(apiKey, siteId) {
    const hash = crypto.createHash('sha256')
      .update(`${apiKey}:${siteId}:${Date.now()}`)
      .digest('hex')
      .substring(0, 16);
    
    return `alertstream-${hash}`;
  }
  
  async verifyDNS(domain, expectedHash) {
    try {
      const txtRecords = await dns.resolveTxt(`_alertstream.${domain}`);
      const found = txtRecords.flat().some(record => 
        record.includes(expectedHash)
      );
      return found;
    } catch (error) {
      return false;
    }
  }
  
  parseDNSRecord(record) {
    // Parse alertstream-{hash} format
    const parts = record.split('-');
    if (parts.length >= 2) {
      return {
        verified: true,
        hash: parts[1]
      };
    }
    return { verified: false };
  }
}

module.exports = new DNSAutoSetup();
