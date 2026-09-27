const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const jobs = [
  // diagrams — lossless, text must stay crisp
  { in: 'custom-label-1.png', out: 'custom-label-diagram.webp', w: 1400, lossless: true },
  // photographs — lossy q80
  { in: 'Himshikhar 500ml product photo.png', out: 'bottle-500ml-angle.webp', w: 1000 },
  { in: 'hero_product-card-500ml.webp', out: 'card-500ml.webp', w: 800 },
  { in: '1L himshikhar bottle .png', out: 'card-1l.webp', w: 800 },
  { in: '1L Himshikhar product page.png', out: 'product-1l-main.webp', w: 800 },
  { in: '900ml Custom Labels.png', out: 'card-900ml.webp', w: 800 },
  { in: 'jar.png', out: 'card-jar.webp', w: 800 },
  { in: '500ml_pack.jpg', out: 'pack-500ml.webp', w: 800 },
  { in: 'Custom LABEL .png', out: 'custom-label-photo.webp', w: 800 },
  // logo — small, keep alpha
  { in: 'aqua himshikhar word logo transparent copy.png', out: 'logo.webp', w: 300 },
];

(async () => {
  fs.mkdirSync('_originals', { recursive: true });
  for (const j of jobs) {
    if (!fs.existsSync(j.in)) { console.log('MISSING:', j.in); continue; }
    await sharp(j.in)
      .resize({ width: j.w, withoutEnlargement: true })
      .webp(j.lossless ? { lossless: true } : { quality: 80 })
      .toFile(j.out);
    fs.copyFileSync(j.in, path.join('_originals', path.basename(j.in)));
    fs.unlinkSync(j.in); // Clean up original from deploy folder
    const after = fs.statSync(j.out).size;
    const before = fs.statSync(path.join('_originals', path.basename(j.in))).size;
    console.log(`${j.out}: ${(before/1e6).toFixed(2)}MB → ${(after/1e3).toFixed(0)}KB`);
  }
})();
