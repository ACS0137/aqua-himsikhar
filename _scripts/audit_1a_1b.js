const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
const findings = [];

function addFinding(sev, rule, file, msg, evidence = '[VERIFIED IN CODE]') {
  findings.push({ severity: sev, rule, file, msg, evidence });
}

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

  // Extract <style> blocks
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  let allCss = '';
  while ((match = styleRegex.exec(content)) !== null) {
    allCss += match[1] + '\n';
  }

  // 1a. CSS structural validity
  const openBraces = (allCss.match(/\{/g) || []).length;
  const closeBraces = (allCss.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    addFinding('Critical', '1a', file, `Mismatched CSS braces: ${openBraces} open vs ${closeBraces} close`);
  }

  const mediaBlocks = allCss.match(/@media\s*\(\s*max-width\s*:\s*768px\s*\)/g);
  if (mediaBlocks && mediaBlocks.length > 1) {
    addFinding('Low', '1a', file, `Duplicate @media (max-width: 768px) blocks found (${mediaBlocks.length} times)`);
  }

  // Nested media queries -> "@media { @media }"
  // Very rough check: look for "@media" inside a block that hasn't closed yet.
  
  // 1b. Document basics
  if (!content.includes('name="viewport"') || !content.includes('width=device-width') || !content.includes('initial-scale=1')) {
    addFinding('Critical', '1b', file, `Missing or invalid viewport meta tag`);
  }

  // charset must be before any text content
  const charsetIndex = content.toLowerCase().indexOf('<meta charset="utf-8"');
  if (charsetIndex === -1) {
    addFinding('Critical', '1b', file, `Missing or invalid charset meta tag (utf-8)`);
  } else {
    // Is it before <title>?
    const titleIdx = content.indexOf('<title');
    if (titleIdx !== -1 && titleIdx < charsetIndex) {
      addFinding('Critical', '1b', file, `Charset meta tag appears after <title>, needs to be before text content`);
    }
  }

  if (!content.includes('<html lang=')) {
    addFinding('Medium', '1b', file, `Missing lang attribute on <html>`);
  }

  const httpsRegex = /http:\/\//g;
  let httpMatch;
  while ((httpMatch = httpsRegex.exec(content)) !== null) {
    const snippet = content.substring(httpMatch.index, httpMatch.index + 40).replace(/\n/g, '');
    if (!snippet.includes('w3.org')) {
      addFinding('High', '1b', file, `Found http:// reference: ${snippet}`);
    }
  }
});

fs.writeFileSync('findings_1ab.json', JSON.stringify(findings, null, 2));
console.log('1ab done');
