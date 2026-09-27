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

const mobileNavJs = `
// Mobile Navigation Drawer Toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', toggleMobileNav);
}

function toggleMobileNav() {
  const isOpen = document.body.classList.contains('nav-open');
  if (isOpen) {
    closeMobileNav();
  } else {
    document.body.classList.add('nav-open');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileNav() {
  document.body.classList.remove('nav-open');
  if (mobileMenuToggle) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', closeMobileNav);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
    closeMobileNav();
  }
});
`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('function toggleMobileNav()')) {
    console.log(`Mobile nav JS already present in ${file}`);
    continue;
  }

  const scriptEndIdx = content.lastIndexOf('</script>');
  if (scriptEndIdx !== -1) {
    content = content.slice(0, scriptEndIdx) + mobileNavJs + '\n' + content.slice(scriptEndIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added mobile nav JS to ${file}`);
  }
}
