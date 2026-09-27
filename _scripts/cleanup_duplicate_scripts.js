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

const singleMobileNavJs = `
// Mobile Navigation Drawer Toggle
(function() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  if (!toggleBtn) return;

  function openNav() {
    document.body.classList.add('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', function() {
    const isOpen = document.body.classList.contains('nav-open');
    if (isOpen) closeNav(); else openNav();
  });

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
    }
  });
})();
`;

for (const file of targetFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Strip ALL previous occurrences of mobile nav toggle JS
  content = content.replace(/\/\/ Mobile Navigation Drawer Toggle[\s\S]*?\}\s*\);\s*\}\)\(\);\s*/g, '');
  content = content.replace(/\/\/ Mobile Navigation Drawer Toggle[\s\S]*?\}\s*\);\s*/g, '');
  content = content.replace(/const mobileMenuToggle[\s\S]*?function toggleMobileNav[\s\S]*?\}\s*\);\s*/g, '');

  const bodyEndIdx = content.lastIndexOf('</body>');
  if (bodyEndIdx === -1) continue;

  // Insert single clean self-contained mobile nav IIFE before </body> inside an inline <script> block
  const footerIdx = content.lastIndexOf('</footer>');
  const scriptStartIdx = content.lastIndexOf('<script', bodyEndIdx);

  if (scriptStartIdx > footerIdx && !content.substring(scriptStartIdx, bodyEndIdx).includes('src=')) {
    const scriptEndIdx = content.lastIndexOf('</script>', bodyEndIdx);
    content = content.slice(0, scriptEndIdx) + singleMobileNavJs + '\n' + content.slice(scriptEndIdx);
  } else {
    const scriptBlock = `\n<script>\n${singleMobileNavJs}\n</script>\n`;
    content = content.slice(0, bodyEndIdx) + scriptBlock + content.slice(bodyEndIdx);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned up and fixed JS in ${file}`);
}
