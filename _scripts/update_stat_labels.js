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

const replacements = [
  { oldStr: /Years delivering in the Valley/gi, newStr: 'Years in the Valley' },
  { oldStr: /Purification stages, every jar/gi, newStr: 'Purification stages' },
  { oldStr: /Notice to change your order/gi, newStr: 'To change an order' },
  { oldStr: /Delivery days a week/gi, newStr: 'Delivery days' }
];

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;

  for (const { oldStr, newStr } of replacements) {
    if (oldStr.test(content)) {
      content = content.replace(oldStr, newStr);
      fileChanged = true;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated stat labels in ${file}`);
  }
}
