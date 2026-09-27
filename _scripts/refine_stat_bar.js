const fs = require('fs');
const path = require('path');

const targetFiles = [
  'aqua_himshikhar_brand_website.html',
  'article-template.html',
  'business.html',
  'contact.html',
  'custom-labels.html',
  'journal.html',
  'privacy.html',
  'product_19l_jar.html',
  'product_1l_bottle.html',
  'product_500ml_bottle.html',
  'terms.html'
];

const newMobileStatNum = `  .stat-num {
    font-size: 2.4rem !important;
    line-height: 1 !important;
    min-height: 2.4rem !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
    font-variant-numeric: lining-nums;
    font-feature-settings: "lnum" 1;
  }`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace .stat-num in mobile media query block
  content = content.replace(/\.stat-num\s*\{\s*font-size:\s*2rem[\s\S]*?font-feature-settings:[^}]*\}/g, newMobileStatNum);

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Successfully updated mobile .stat-num CSS rules.');
