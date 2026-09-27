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

// Read logo.svg content
const logoSvgPath = path.join(__dirname, 'logo.svg');
const svgRaw = fs.readFileSync(logoSvgPath, 'utf8');

// Extract path d attribute
const dMatch = svgRaw.match(/d="([^"]+)"/);
if (!dMatch) {
  console.error("Could not find path d attribute in logo.svg");
  process.exit(1);
}
const pathD = dMatch[1];

const inlineSvg = `<svg class="logo-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 209.4" role="img" aria-label="Aqua Himshikhar">
    <title>Aqua Himshikhar</title>
    <path fill="currentColor" fill-rule="evenodd" d="${pathD}"/>
  </svg>`;

const changedFiles = [];

for (const fileName of targetFiles) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing file: ${fileName}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;

  // 1. Replace <img> logo tag with inline <svg>
  // Regex to match <img ...logo.webp...class="logo-img"...> or similar <img ...class="logo-img"...>
  const imgRegex = /<img\s+[^>]*src=["'][^"']*logo\.(webp|png)["'][^>]*>/gi;
  const imgRegexAlt = /<img\s+[^>]*class=["']logo-img["'][^>]*>/gi;

  if (imgRegex.test(content)) {
    content = content.replace(imgRegex, inlineSvg);
    fileModified = true;
  } else if (imgRegexAlt.test(content)) {
    content = content.replace(imgRegexAlt, inlineSvg);
    fileModified = true;
  }

  // 2. Update CSS for .logo-img main declaration
  // Look for .logo-img { ... } and replace with new rules (height: 44px; width: auto; color: #ffffff;)
  // Also ensuring filter: is removed.
  const logoCssRegex = /\.logo-img\s*\{[^}]*\}/g;
  
  // We want to differentiate main .logo-img rule from media query overrides if possible,
  // or handle .logo-img rules specifically.
  // Main rule is typically outside media queries or has height: 36px / filter brightness.
  
  content = content.replace(/\.logo-img\s*\{[\s\S]*?\}/g, (match, offset, fullStr) => {
    // Check if this is inside a media query by scanning backwards or looking at properties
    // Main block has filter or height: 36px/32px/24px or width: auto
    if (match.includes('filter:') || match.includes('36px') || match.includes('object-fit')) {
      fileModified = true;
      return `.logo-img {
  height: 44px;
  width: auto;
  color: #ffffff;
  transition: transform 0.3s ease;
}`;
    }
    // If it's a mobile query override like height: 28px / 24px / 32px
    if (match.includes('24px') || match.includes('28px')) {
      fileModified = true;
      return `.logo-img { height: 32px; }`;
    }
    return match;
  });

  // Ensure media query height: 32px is enforced
  // Also check if any .logo-img in media queries still has 24px or 28px
  content = content.replace(/\.logo-img\s*\{\s*height:\s*(24|28|36)px\s*(!important)?;\s*\}/g, '.logo-img { height: 32px; }');

  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    changedFiles.push(fileName);
  }
}

console.log('Successfully processed. Changed files:', changedFiles);
