const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
const findings = [];
function addFinding(sev, rule, file, msg, evidence = '[VERIFIED IN CODE]') {
  findings.push({ severity: sev, rule, file, msg, evidence });
}

function checkDuplicateIds(content, file) {
  const idRegex = /\sid="([^"]+)"/g;
  let match;
  const ids = new Set();
  const dupes = new Set();
  while ((match = idRegex.exec(content)) !== null) {
    if (ids.has(match[1])) {
      dupes.add(match[1]);
    }
    ids.add(match[1]);
  }
  dupes.forEach(id => {
    addFinding('High', '1c', file, `Duplicate ID found: "${id}"`);
  });
  return ids;
}

function checkHrefs(content, file, ids) {
  const hrefRegex = /\shref="([^"]+)"/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const link = match[1];
    if (link === '#') {
      // Find the text inside the tag
      const start = match.index;
      const endTag = content.indexOf('>', start);
      const closeTag = content.indexOf('</a>', endTag);
      let text = 'unknown';
      if (endTag !== -1 && closeTag !== -1) {
        text = content.substring(endTag + 1, closeTag).replace(/<[^>]+>/g, '').trim();
      }
      addFinding('Low', '1c', file, `Placeholder href="#" with text: "${text}"`);
    } else if (link.startsWith('#') && link.length > 1) {
      const anchor = link.substring(1);
      if (!ids.has(anchor)) {
        addFinding('Medium', '1c', file, `href="#${anchor}" points to missing ID on this page`);
      }
    } else if (!link.startsWith('http') && !link.startsWith('tel:') && !link.startsWith('mailto:')) {
      const targetPath = path.join(__dirname, link.split('#')[0].split('?')[0]);
      if (!fs.existsSync(targetPath)) {
        addFinding('Critical', '1c', file, `Broken local link: href="${link}"`);
      }
    }
  }
}

function checkSrcs(content, file) {
  const srcRegex = /\ssrc="([^"]+)"/g;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    const link = match[1];
    if (!link.startsWith('http') && !link.startsWith('data:')) {
      const targetPath = path.join(__dirname, link.split('?')[0]);
      if (!fs.existsSync(targetPath)) {
        addFinding('Critical', '1c', file, `Broken local src: src="${link}"`);
      }
    }
  }
}

function checkCssUrls(content, file) {
  const urlRegex = /url\(['"]?([^'"\)]+)['"]?\)/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const link = match[1];
    if (!link.startsWith('http') && !link.startsWith('data:')) {
      const targetPath = path.join(__dirname, link.split('?')[0].split('#')[0]);
      if (!fs.existsSync(targetPath)) {
        addFinding('Critical', '1c', file, `Broken CSS url(): url("${link}")`);
      }
    }
  }
}

function checkOnClicks(content, file) {
  const clickRegex = /\sonclick="([^"]+)"/g;
  let match;
  while ((match = clickRegex.exec(content)) !== null) {
    const handler = match[1];
    const funcNameMatch = handler.match(/^([a-zA-Z0-9_]+)\(/);
    if (funcNameMatch) {
      const funcName = funcNameMatch[1];
      // Does function exist in content or config.js / order-modal.js?
      const funcRegex = new RegExp(`function\\s+${funcName}\\s*\\(|const\\s+${funcName}\\s*=\\s*function|const\\s+${funcName}\\s*=\\s*\\(`);
      
      const configPath = path.join(__dirname, 'config.js');
      const orderPath = path.join(__dirname, 'order-modal.js');
      let combined = content;
      if (fs.existsSync(configPath)) combined += fs.readFileSync(configPath, 'utf8');
      if (fs.existsSync(orderPath)) combined += fs.readFileSync(orderPath, 'utf8');
      
      if (!funcRegex.test(combined)) {
        addFinding('High', '1c', file, `onclick handler "${funcName}" called but never defined`);
      }
    }
  }
}

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  
  const ids = checkDuplicateIds(content, file);
  checkHrefs(content, file, ids);
  checkSrcs(content, file);
  checkCssUrls(content, file);
  checkOnClicks(content, file);
});

fs.writeFileSync('findings_1c.json', JSON.stringify(findings, null, 2));
console.log('1c done');
