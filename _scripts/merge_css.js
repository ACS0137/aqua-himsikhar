const fs = require('fs');

const replacementCss = `
@media (max-width: 768px) {
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
  .logo-img { height: 24px; }
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
}
</style>
`;

const files = fs.readdirSync('.');
for (const file of files) {
  if (!file.endsWith('.html')) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Find where the first injected block starts
  const startIndex = content.indexOf('@media (max-width: 768px) {\n  /* Nav — halve the height */');
  if (startIndex === -1) {
      console.log(`Could not find the injected block in ${file}`);
      continue;
  }
  
  // We want to replace everything from startIndex down to </style> 
  const styleEndIndex = content.indexOf('</style>', startIndex);
  if (styleEndIndex !== -1) {
    // Replace the two injected blocks + </style> with the new single block + </style>
    content = content.substring(0, startIndex) + replacementCss.trim() + content.substring(styleEndIndex + 8);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Merged CSS in ${file}`);
  }
}
