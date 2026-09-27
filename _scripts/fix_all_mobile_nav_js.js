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

const cleanMobileNavJs = `
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

  // Remove any misplaced toggleMobileNav blocks
  content = content.replace(/\/\/ Mobile Navigation Drawer Toggle[\s\S]*?closeMobileNav\(\);\s*\}\s*\);\s*/g, '');

  // Now find the main script block before </body> (or the last </script> before </body>)
  const bodyEndIdx = content.lastIndexOf('</body>');
  if (bodyEndIdx !== -1) {
    const scriptEndIdx = content.lastIndexOf('</script>', bodyEndIdx);
    if (scriptEndIdx !== -1) {
      content = content.slice(0, scriptEndIdx) + cleanMobileNavJs + '\n' + content.slice(scriptEndIdx);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Placed clean mobile nav JS before </body> in ${file}`);
    }
  }
}
