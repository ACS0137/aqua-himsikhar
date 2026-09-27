const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

const consistency = {
  nav: {},
  mobileJs: {},
  media768: {},
  rootVars: {},
  footer: {},
  configLoad: {},
  orderModalLoad: {}
};

const dataVars = {
  volumes: new Set(),
  stages: new Set(),
  clients: new Set(),
  foundingYear: new Set(),
  districts: new Set(),
  freq: new Set(),
  prices: new Set(),
  phones: new Set(),
  emails: new Set(),
  wording: new Set()
};

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

  // 1d: config.js and order-modal.js load
  consistency.configLoad[file] = content.includes('src="config.js"');
  consistency.orderModalLoad[file] = content.includes('src="order-modal.js"');

  // Nav extraction
  const navRegex = /<nav>([\s\S]*?)<\/nav>/;
  const navMatch = navRegex.exec(content);
  if (navMatch) {
    const navText = navMatch[1].replace(/\s+/g, ' ').trim();
    const links = (navText.match(/<a[^>]*>(.*?)<\/a>/g) || []).map(a => a.replace(/<[^>]+>/g, '').trim());
    consistency.nav[file] = links.join('|');
  }

  // Mobile menu JS
  consistency.mobileJs[file] = content.includes('function toggleMobileNav()');

  // Root vars extraction
  const rootRegex = /:root\s*\{([^}]+)\}/;
  const rootMatch = rootRegex.exec(content);
  if (rootMatch) {
    consistency.rootVars[file] = rootMatch[1].replace(/\s+/g, '').trim();
  } else {
    consistency.rootVars[file] = "MISSING";
  }

  // 1e: Data extraction
  // Volumes
  if (content.match(/\b(19|20)-?L(iter)?s?\b/gi)) {
    content.match(/\b(19|20)-?L(iter)?s?\b/gi).forEach(m => dataVars.volumes.add(`${m} in ${file}`));
  }
  // Stages
  if (content.match(/\b(7|8|seven|eight)[-\s]?stage\b/gi)) {
    content.match(/\b(7|8|seven|eight)[-\s]?stage\b/gi).forEach(m => dataVars.stages.add(`${m} in ${file}`));
  }
  // Founding year
  if (content.match(/\b(2018|2019)\b/g)) {
    content.match(/\b(2018|2019)\b/g).forEach(m => dataVars.foundingYear.add(`${m} in ${file}`));
  }
  // Phones
  const phoneMatches = content.match(/\b977\s?98[0-9]{8}\b|XXXX/g);
  if (phoneMatches) {
    phoneMatches.forEach(m => dataVars.phones.add(`${m} in ${file}`));
  }
  // Wording
  const wordMatches = content.match(/\b(pristine|high altitude|iso-certified|mineral water)\b/gi);
  if (wordMatches) {
    wordMatches.forEach(m => dataVars.wording.add(`${m} in ${file}`));
  }
});

fs.writeFileSync('findings_1de.json', JSON.stringify({ consistency, dataVars: Object.fromEntries(Object.entries(dataVars).map(([k,v]) => [k, Array.from(v)])) }, null, 2));
console.log('1de done');
