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

  // 1. Update font-feature-settings in .stat-num CSS
  content = content.replace(/\.stat-num\s*\{([^}]*)\}/g, (match, body) => {
    let newBody = body;
    if (!newBody.includes('font-variant-numeric')) {
      newBody += '\n  font-variant-numeric: lining-nums;';
    }
    if (!newBody.includes('font-feature-settings')) {
      newBody += '\n  font-feature-settings: "lnum" 1;';
    }
    return `.stat-num {${newBody} }`;
  });

  // 2. Add .stat-num-text CSS if not present
  if (!content.includes('.stat-num-text')) {
    const statNumCssIdx = content.indexOf('.stat-num {');
    if (statNumCssIdx !== -1) {
      const closingIdx = content.indexOf('}', statNumCssIdx);
      if (closingIdx !== -1) {
        const extraCss = `\n.stat-num-text { font-size: 2.5rem; }\n@media (max-width: 768px) { .stat-num-text { font-size: 1.45rem !important; } }`;
        content = content.slice(0, closingIdx + 1) + extraCss + content.slice(closingIdx + 1);
      }
    }
  }

  // 3. Update HTML markup for the fourth stat (and third stat class if needed)
  content = content.replace(/<div class="stat-num">\s*7\s*<\/div>\s*<div class="stat-label">\s*(Delivery days a week|Delivery days|WE DELIVER|We deliver)\s*<\/div>/gi,
    `<div class="stat-num stat-num-text">Every day</div>\n      <div class="stat-label">We deliver</div>`);

  content = content.replace(/<div class="stat-num">\s*12 hrs\s*<\/div>/gi,
    `<div class="stat-num stat-num-text">12 hrs</div>`);

  // 4. Update any remaining stat label variations
  content = content.replace(/Years delivering in the Valley/gi, 'Years in the Valley');
  content = content.replace(/Purification stages, every jar/gi, 'Purification stages');
  content = content.replace(/Notice to change your order/gi, 'To change an order');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated stat bar in ${file}`);
}
