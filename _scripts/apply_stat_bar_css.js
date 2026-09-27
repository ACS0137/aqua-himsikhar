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

const statBarCss = `
  /* Stat Bar Mobile Grid */
  .stat-bar, .stats-inner {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 0 !important;
    padding: 2rem 1.5rem !important;
  }
  .stat-block {
    padding: 1.4rem 0.5rem !important;
    border-bottom: 1px solid rgba(255,255,255,0.10) !important;
    border-right: none !important;
  }
  .stat-block:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.10) !important; }
  .stat-block:nth-child(3),
  .stat-block:nth-child(4) { border-bottom: none !important; }

  .stat-num { font-size: 2rem !important; line-height: 1 !important; margin-bottom: 0.4rem !important; }
  .stat-label { font-size: 0.65rem !important; letter-spacing: 0.08em !important; line-height: 1.35 !important; }
`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('/* Stat Bar Mobile Grid */')) {
    console.log(`Already applied to ${file}`);
    continue;
  }

  // Insert before the closing bracket of the last @media (max-width: 768px) block or style block
  const media768Idx = content.lastIndexOf('@media (max-width: 768px)');
  if (media768Idx !== -1) {
    const closingBraceIdx = content.indexOf('}', media768Idx);
    if (closingBraceIdx !== -1) {
      content = content.slice(0, closingBraceIdx) + statBarCss + content.slice(closingBraceIdx);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Applied to ${file}`);
      continue;
    }
  }

  // Fallback to inserting before </style>
  const styleEndIdx = content.lastIndexOf('</style>');
  if (styleEndIdx !== -1) {
    const fullBlock = `\n@media (max-width: 768px) {${statBarCss}\n}\n`;
    content = content.slice(0, styleEndIdx) + fullBlock + content.slice(styleEndIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Applied fallback to ${file}`);
  }
}
