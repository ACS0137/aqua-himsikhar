const fs = require('fs');
const path = require('path');

const replacements = {
  'custom-label-1.png': 'custom-label-diagram.webp',
  'Himshikhar 500ml product photo.png': 'bottle-500ml-angle.webp',
  'hero_product-card-500ml.webp': 'card-500ml.webp',
  '1L himshikhar bottle .png': 'card-1l.webp',
  '1L Himshikhar product page.png': 'product-1l-main.webp',
  '900ml Custom Labels.png': 'card-900ml.webp',
  'jar.png': 'card-jar.webp',
  '500ml_pack.jpg': 'pack-500ml.webp',
  'Custom LABEL .png': 'custom-label-photo.webp',
  'aqua himshikhar word logo transparent copy.png': 'logo.webp'
};

const dir = __dirname;
const files = fs.readdirSync(dir);

for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.statSync(fullPath).isDirectory()) continue;
  if (!file.endsWith('.html') && !file.endsWith('.js') && !file.endsWith('.css')) continue;
  if (file === 'convert.js' || file === 'replace.js') continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  for (const [oldName, newName] of Object.entries(replacements)) {
    const encodedOldName = encodeURI(oldName).replace(/%20/g, '(?:%20| )'); 
    const regex = new RegExp(oldName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '|' + encodedOldName, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, newName);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log("Done");
