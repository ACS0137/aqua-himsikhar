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

const svgRaw = fs.readFileSync(path.join(__dirname, 'logo.svg'), 'utf8');
const dMatch = svgRaw.match(/d="([^"]+)"/);
const pathD = dMatch[1];
const viewBoxMatch = svgRaw.match(/viewBox="([^"]+)"/);
const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 1000 209.4';

const exactSingleLineSvg = `<svg class="logo-img" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Aqua Himshikhar"><title>Aqua Himshikhar</title><path fill="currentColor" fill-rule="evenodd" d="${pathD}"/></svg>`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any <svg class="logo-img"...>...</svg> or <img...logo-img...> with single line SVG
  content = content.replace(/<svg\s+class=["']logo-img["'][\s\S]*?<\/svg>/gi, exactSingleLineSvg);
  content = content.replace(/<img\s+[^>]*logo-img[^>]*>/gi, exactSingleLineSvg);
  content = content.replace(/<img\s+[^>]*logo\.(webp|png|svg)[^>]*>/gi, exactSingleLineSvg);

  // Replace main .logo-img rule
  content = content.replace(/\.logo-img\s*\{[^}]*\}/g, (match) => {
    if (match.includes('32px')) {
      return `.logo-img { height: 32px; }`;
    }
    return `.logo-img { height: 44px; width: auto; color: #ffffff; }`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('All 11 files updated to exact requested layout and CSS rules.');
