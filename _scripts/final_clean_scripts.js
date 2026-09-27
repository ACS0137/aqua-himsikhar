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

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove orphan closeMobileNav event listeners
  content = content.replace(/document\.addEventListener\('keydown',\s*\(e\)\s*=>\s*\{\s*if\s*\(e\.key\s*===\s*'Escape'\s*&&\s*document\.body\.classList\.contains\('nav-open'\)\)\s*\{\s*closeMobileNav\(\);\s*\}\s*\}\);\s*/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Cleaned up orphan Escape key listeners across all target HTML files.');
