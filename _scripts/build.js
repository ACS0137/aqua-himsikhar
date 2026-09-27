const fs = require('fs');
const path = require('path');

// Read .env if present
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valParts] = line.split('=');
      envVars[key.trim()] = valParts.join('=').trim();
    }
  });
}

const configContent = `/**
 * Aqua Himshikhar - Runtime Environment Configuration
 * Generated from .env for AWS S3 Deployment
 */
window.ENV_CONFIG = {
  WHATSAPP_NUMBER: "${envVars.WHATSAPP_NUMBER || '9779851319342'}",
  CALL_NUMBER: "${envVars.CALL_NUMBER || '+9779851319342'}",
  SMS_NUMBER: "${envVars.SMS_NUMBER || '+9779851319342'}",
  DEFAULT_ORDER_MESSAGE: "${envVars.DEFAULT_ORDER_MESSAGE || 'Hello Aqua Himshikhar, I would like to place an order for purified water.'}"
};
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
console.log('✅ Environment configuration injected into config.js for S3 deployment!');
