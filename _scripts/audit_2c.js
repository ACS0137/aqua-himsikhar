const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html') || (f.endsWith('.js') && !f.includes('node_modules') && !f.includes('audit')));
const findings = [];
function addFinding(sev, rule, file, msg, evidence = '[VERIFIED IN CODE]') {
  findings.push({ severity: sev, rule, file, msg, evidence });
}

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  
  if (content.match(/['"]sk_[a-zA-Z0-9]{10,}['"]/)) {
    addFinding('Critical', '2c', file, `Possible API secret found`);
  }

  if (content.includes('.innerHTML =')) {
    addFinding('High', '2c', file, `Dynamic assignment to innerHTML found (potential XSS)`);
  }

  if (content.includes('target="_blank"') && !content.includes('noopener')) {
    addFinding('High', '2c', file, `target="_blank" used without rel="noopener"`);
  }

  if (content.includes('<form') && !content.includes('action=') && !content.includes('onsubmit=')) {
    addFinding('High', '2c', file, `Form found with no action or onsubmit attribute`);
  }

  if (content.includes('fetch(') && !content.includes('.catch') && !content.includes('try {')) {
    addFinding('Medium', '2c', file, `fetch() called without obvious catch block`);
  }

  if (file === 'order-modal.js' && content.includes('config.WHATSAPP_NUMBER') && !content.includes('typeof config')) {
    addFinding('High', '2c', file, `Access to config object without checking if config.js loaded`);
  }
});

fs.writeFileSync('findings_2c_clean.json', JSON.stringify(findings, null, 2));
console.log('2c done');
