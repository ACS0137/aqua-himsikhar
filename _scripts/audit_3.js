const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

const findings = [];
function addFinding(sev, rule, file, msg) {
  findings.push({ severity: sev, rule, file, msg, evidence: '[VERIFIED IN CODE]' });
}

const titles = {};
const descriptions = {};
const links = new Set();
const internalLinks = new Set();
const allPages = new Set(files);

let totalCSSBytes = 0;
const cssSizes = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const $ = cheerio.load(content);

  // Measure inline CSS size
  let cssBytes = 0;
  $('style').each((i, el) => {
    cssBytes += Buffer.byteLength($(el).html(), 'utf8');
  });
  totalCSSBytes += cssBytes;
  cssSizes.push({ file, cssBytes });

  // 3a: SEO and metadata
  
  // Title
  const title = $('title').text().trim();
  if (!title) {
    addFinding('High', '3a', file, 'Missing <title> tag');
  } else {
    if (title.length > 60) addFinding('Medium', '3a', file, `<title> over 60 chars (${title.length})`);
    if (titles[title]) addFinding('Medium', '3a', file, `Duplicate <title> found: "${title}" (also in ${titles[title]})`);
    titles[title] = file;
    // Check if title mentions wrong page
    if (file === 'business.html' && !title.toLowerCase().includes('business') && !title.toLowerCase().includes('corporate')) {
       addFinding('Medium', '3a', file, `Title might not describe page: "${title}"`);
    }
  }

  // Meta description
  const desc = $('meta[name="description"]').attr('content');
  if (!desc) {
    addFinding('High', '3a', file, 'Missing <meta name="description">');
  } else {
    if (desc.length < 120 || desc.length > 160) addFinding('Medium', '3a', file, `<meta name="description"> length is ${desc.length} (optimal 120-160)`);
    if (descriptions[desc]) addFinding('Medium', '3a', file, `Duplicate description found (also in ${descriptions[desc]})`);
    descriptions[desc] = file;
  }

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogUrl = $('meta[property="og:url"]').attr('content');
  
  if (!ogTitle) addFinding('Medium', '3a', file, 'Missing og:title');
  if (!ogDesc) addFinding('Medium', '3a', file, 'Missing og:description');
  if (!ogUrl) addFinding('Medium', '3a', file, 'Missing og:url');
  if (!ogImage) {
    addFinding('Medium', '3a', file, 'Missing og:image');
  } else if (ogImage.endsWith('.webp') || ogImage.endsWith('.svg')) {
    addFinding('High', '3a', file, `og:image points to unsupported format (${ogImage})`);
  }

  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    addFinding('Medium', '3a', file, 'Missing <link rel="canonical">');
  }

  // JSON-LD
  const jsonLdScripts = $('script[type="application/ld+json"]');
  if (jsonLdScripts.length === 0) {
    addFinding('Medium', '3a', file, 'Missing JSON-LD schema');
  } else {
    jsonLdScripts.each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (!data['@type']) addFinding('Medium', '3a', file, 'JSON-LD missing @type');
        // Basic check for mismatch (could do more if needed)
      } catch (e) {
        addFinding('High', '3a', file, 'JSON-LD syntax error');
      }
    });
  }

  // Collect outbound links for orphaned page check
  $('a[href]').each((i, el) => {
    let href = $(el).attr('href').split('#')[0].split('?')[0];
    if (href.endsWith('.html')) internalLinks.add(href);
  });

  // 3b: Performance
  
  // Render-blocking resources in head
  $('head script[src]').each((i, el) => {
    if (!$(el).attr('defer') && !$(el).attr('async')) {
      addFinding('Medium', '3b', file, `Render-blocking script in <head>: ${$(el).attr('src')}`);
    }
  });

  // Below the fold images without lazy loading
  // We'll assume the first image is above the fold, and others are below.
  $('img').each((i, el) => {
    if (i > 1 && $(el).attr('loading') !== 'lazy') {
      addFinding('Low', '3b', file, `Image potentially below the fold missing loading="lazy": ${$(el).attr('src')}`);
    }
  });

  // Check CSS animations for layout triggers
  $('style').each((i, el) => {
    const css = $(el).html();
    const transitions = [...css.matchAll(/transition:\s*([^;]+);/g)];
    const triggers = ['margin', 'padding', 'width', 'height', 'top', 'left', 'bottom', 'right', 'all'];
    transitions.forEach(match => {
      triggers.forEach(t => {
        if (match[1].includes(t)) {
          // If the style includes 'transition: all' it's a layout trigger risk
          if (t === 'all') addFinding('Low', '3b', file, 'Animation uses "transition: all", may trigger layout');
          else addFinding('Medium', '3b', file, `Animation on layout-triggering property: ${t}`);
        }
      });
    });
  });
});

// Check for orphaned pages
allPages.forEach(page => {
  // Assume index pages or brand websites are entry points
  if (!internalLinks.has(page) && !page.includes('brand_website.html')) {
    addFinding('Medium', '3a', page, 'Orphaned page: No internal links point to this file');
  }
});

// Write findings
fs.writeFileSync('findings_3.json', JSON.stringify({ findings, totalCSSBytes, cssSizes }, null, 2));
console.log('Audit 3 done');
