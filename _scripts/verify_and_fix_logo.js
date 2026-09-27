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
  'terms.html',
  'aqua_kathmandu_brand_website.html',
  'hospitality.html',
  'dispatch.html'
];

const svgRaw = fs.readFileSync(path.join(__dirname, 'logo.svg'), 'utf8');
const dMatch = svgRaw.match(/d="([^"]+)"/);
const pathD = dMatch[1];

const targetSvgStr = `<svg class="logo-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 209.4" role="img" aria-label="Aqua Himshikhar">
    <title>Aqua Himshikhar</title>
    <path fill="currentColor" fill-rule="evenodd" d="${pathD}"/>
  </svg>`;

const report = [];

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace <img> in <a ...class="logo"...> or with logo image src
  content = content.replace(/<img\s+[^>]*logo-img[^>]*>/gi, targetSvgStr);
  content = content.replace(/<img\s+[^>]*logo\.(webp|png|svg)[^>]*>/gi, targetSvgStr);

  // 2. Update .logo-img main CSS definition
  content = content.replace(/\.logo-img\s*\{[^}]*filter:[^}]*\}/g, `.logo-img {
  height: 44px;
  width: auto;
  color: #ffffff;
}`);

  // Clean any remaining filter: inside .logo-img
  content = content.replace(/(\.logo-img\s*\{[^}]*)filter:[^;\}]*;?/g, '$1');

  // Ensure main .logo-img rule is updated to 44px, width: auto, color: #ffffff
  content = content.replace(/\.logo-img\s*\{\s*height:\s*36px;[^}]*\}/g, `.logo-img {
  height: 44px;
  width: auto;
  color: #ffffff;
}`);

  // 3. Update @media (max-width: 768px) .logo-img { height: 32px; }
  content = content.replace(/\.logo-img\s*\{\s*height:\s*(24|28)px\s*(!important)?;\s*\}/g, '.logo-img { height: 32px; }');

  fs.writeFileSync(filePath, content, 'utf8');

  // Verify file status
  const finalContent = fs.readFileSync(filePath, 'utf8');
  const hasFilterOnLogoImg = /\.logo-img\s*\{[^}]*filter:/i.test(finalContent);
  const hasSvgLogo = finalContent.includes('<svg class="logo-img"');
  const has32pxMobile = /@media[^{]*768px[^{]*\{[\s\S]*?\.logo-img\s*\{\s*height:\s*32px;/i.test(finalContent) || finalContent.includes('.logo-img { height: 32px; }');

  report.push({
    file,
    hasSvgLogo,
    hasFilterOnLogoImg,
    has32pxMobile
  });
}

console.log(JSON.stringify(report, null, 2));
