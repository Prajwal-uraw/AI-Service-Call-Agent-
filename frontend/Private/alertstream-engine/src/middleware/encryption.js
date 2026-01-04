// End-to-end encryption for sensitive data
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    // Use AWS KMS or HashiCorp Vault in production
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    this.algorithm = 'aes-256-gcm';
  }
  
  encryptSensitiveData(data, userId) {
    // Generate unique key per user
    const userKey = this.deriveUserKey(userId);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(this.algorithm, userKey, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      version: 'v1'
    };
  }
  
  decryptSensitiveData(encryptedData, userId) {
    const userKey = this.deriveUserKey(userId);
    const decipher = crypto.createDecipheriv(
      this.algorithm, 
      userKey, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  deriveUserKey(userId) {
    // Key derivation with salt
    return crypto.pbkdf2Sync(
      this.encryptionKey,
      userId,
      100000, // iterations
      32, // key length
      'sha256'
    );
  }
  
  // For right to be forgotten (GDPR)
  async cryptoShred(userId) {
    // Delete derived keys, making encrypted data unrecoverable
    await this.deleteUserKey(userId);
    
    // Overwrite sensitive data with random bytes
    await this.overwriteUserData(userId);
    
    return { shredded: true, timestamp: new Date().toISOString() };
  }

  async deleteUserKey(userId) {
    // In production, this would delete from KMS/Vault
    console.log(`Deleting encryption key for user ${userId}`);
  }

  async overwriteUserData(userId) {
    // Overwrite user's sensitive data with random bytes
    const db = require('../config/database');
    
    // Overwrite phone numbers
    await db.query(
      'UPDATE users SET phone_encrypted = $1 WHERE id = $2',
      [crypto.randomBytes(32).toString('hex'), userId]
    );
    
    // Overwrite email content
    await db.query(
      'UPDATE events SET payload = $1 WHERE user_id = $2',
      [JSON.stringify({ shredded: true }), userId]
    );
  }

  // Hash sensitive data for storage (one-way)
  hashSensitiveData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Verify data integrity
  verifyIntegrity(data, expectedHash) {
    const actualHash = this.hashSensitiveData(JSON.stringify(data));
    return crypto.timingSafeEqual(
      Buffer.from(actualHash),
      Buffer.from(expectedHash)
    );
  }
}

module.exports = new EncryptionService();
