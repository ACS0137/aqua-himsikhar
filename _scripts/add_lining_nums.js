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

  // Add font-variant-numeric: lining-nums; to .stat-num { ... }
  content = content.replace(/\.stat-num\s*\{([^}]*)\}/g, (match, body) => {
    if (body.includes('font-variant-numeric')) return match;
    return `.stat-num {${body}\n  font-variant-numeric: lining-nums; }`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Added font-variant-numeric: lining-nums to .stat-num across all target files.');
