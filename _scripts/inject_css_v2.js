const fs = require('fs');

const cssSnippet = `
@media (max-width: 768px) {
  .nav-inner {
    height: 52px;
    padding: 0 1.2rem;
  }
  .logo-img { height: 24px !important; }
  .hero { padding-top: 4.5rem !important; }
}
`;

const files = fs.readdirSync('.');
for (const file of files) {
  if (!file.endsWith('.html')) continue;
  if (file === 'hospitality.html' || file === 'dispatch.html' || file === 'aqua_kathmandu_brand_website.html') continue;

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('height: 52px;')) {
    console.log(`Already injected in ${file}`);
    continue;
  }

  const styleEndIndex = content.lastIndexOf('</style>');
  if (styleEndIndex !== -1) {
    content = content.slice(0, styleEndIndex) + cssSnippet + content.slice(styleEndIndex);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Injected into ${file}`);
  }
}
