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

  // Fix .logo:hover .logo-img if it got overwritten
  content = content.replace(/\.logo:hover\s*\.logo-img\s*\{[^}]*\}/g, `.logo:hover .logo-img {
  opacity: 1;
  transform: scale(1.02);
}`);

  // Replace base .logo-img CSS block cleanly
  content = content.replace(/\.logo-img\s*\{\s*height:\s*28px;[\s\S]*?\}/g, (match, offset) => {
    // Check if this is the hover rule or mobile rule
    if (content.substring(offset - 20, offset).includes('.logo:hover')) {
      return `.logo:hover .logo-img {
  opacity: 1;
  transform: scale(1.02);
}`;
    }
    return `.logo-img {
  height: 28px;
  width: auto;
  color: #ffffff;
  opacity: 0.92;
  transition: opacity 0.3s ease, transform 0.3s ease;
}`;
  });

  // Set mobile height to 22px inside media query
  content = content.replace(/\.logo-img\s*\{\s*height:\s*(32|28|24)px;?\s*\}/g, (match, h, offset) => {
    // If inside media query or mobile block
    if (content.lastIndexOf('@media', offset) > content.lastIndexOf('</style>', offset)) {
      return `.logo-img { height: 22px; }`;
    }
    return `.logo-img {
  height: 28px;
  width: auto;
  color: #ffffff;
  opacity: 0.92;
  transition: opacity 0.3s ease, transform 0.3s ease;
}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Successfully updated logo CSS across all 11 files.');
