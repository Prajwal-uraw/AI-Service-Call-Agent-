const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'JWT_SECRET',
  'HMAC_SECRET',
  'ENCRYPTION_KEY'
];

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SENDGRID_API_KEY',
  'GOOGLE_CLIENT_ID',
  'MICROSOFT_CLIENT_ID',
  'SLACK_WEBHOOK_URL'
];

function validateEnv() {
  const missing = [];
  const warnings = [];
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  // Check optional variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }
  
  // Validate specific formats
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
    missing.push('ENCRYPTION_KEY (must be exactly 32 characters)');
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET (recommended: at least 32 characters)');
  }
  
  if (process.env.HMAC_SECRET && process.env.HMAC_SECRET.length < 32) {
    warnings.push('HMAC_SECRET (recommended: at least 32 characters)');
  }
  
  // Report results
  if (missing.length > 0) {
    console.error('\n❌ CRITICAL: Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nApplication cannot start. Please set these variables in your .env file.\n');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  WARNING: Missing optional environment variables:');
    warnings.forEach(v => console.warn(`   - ${v}`));
    console.warn('\nSome features may not work without these variables.\n');
  }
  
  console.log('✅ Environment validation passed\n');
  return true;
}

module.exports = { validateEnv };
