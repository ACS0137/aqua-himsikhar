const fs = require('fs');

const cssSnippet = `
@media (max-width: 768px) {
  /* Nav — halve the height */
  nav { padding: 0.7rem 1.2rem; }
  .logo-img { height: 28px; }
  .logo-tagline { display: none; }

  /* Hero — grow to fit, stop clipping */
  .hero {
    min-height: auto;
    padding: 6rem 1.5rem 3.5rem;
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
}
`;

const files = fs.readdirSync('.');
for (const file of files) {
  if (!file.endsWith('.html')) continue;
  if (file === 'hospitality.html' || file === 'dispatch.html' || file === 'aqua_kathmandu_brand_website.html') continue; // Exclude non-main site files based on earlier context

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('/* Nav — halve the height */')) {
    console.log(`Already injected in ${file}`);
    continue;
  }

  const styleEndIndex = content.indexOf('</style>');
  if (styleEndIndex !== -1) {
    content = content.slice(0, styleEndIndex) + cssSnippet + content.slice(styleEndIndex);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Injected into ${file}`);
  }
}
