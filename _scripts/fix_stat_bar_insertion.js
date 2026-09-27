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

const clean768MediaBlock = `@media (max-width: 768px) {
  /* Nav — correctly sized and padded */
  nav {
    padding: 0;
    height: 52px;
    min-height: 0;
  }
  .nav-inner {
    height: 52px;
    padding: 0 1.2rem;
  }
  .logo-img { height: 22px; }
  .logo-tagline { display: none; }

  /* Hero — grow to fit, stop clipping */
  .hero {
    min-height: auto;
    padding: 4.5rem 1.5rem 3.5rem;
    justify-content: flex-start;
    overflow: visible;
  }

  /* Tagline out of the hero */
  .hero-tagline { display: none; }

  .hero h1 {
    font-size: clamp(2rem, 8.5vw, 2.8rem);
    line-height: 1.15;
  }
  .hero p {
    font-size: 0.95rem;
    line-height: 1.55;
  }

  /* Buttons — stacked, full width */
  .hero-cta { flex-direction: column; gap: 0.8rem; width: 100%; }
  .hero-cta a { width: 100%; text-align: center; }

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
}`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any previous broken insertion from /* Nav — correctly sized and padded */ down to </style>
  const navCommentIdx = content.indexOf('/* Nav — correctly sized and padded */');
  if (navCommentIdx !== -1) {
    const mediaStartIdx = content.lastIndexOf('@media (max-width: 768px)', navCommentIdx);
    const styleEndIdx = content.indexOf('</style>', navCommentIdx);

    if (mediaStartIdx !== -1 && styleEndIdx !== -1) {
      content = content.substring(0, mediaStartIdx) + clean768MediaBlock + '\n' + content.substring(styleEndIdx);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleanly fixed 768 media block in ${file}`);
    }
  }
}
