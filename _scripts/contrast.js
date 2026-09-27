function hexToRgb(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  return {r, g, b};
}

function luminance({r, g, b}) {
  const a = [r, g, b].map(v => {
      return v <= 0.03928
          ? v / 12.92
          : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(hex1, hex2) {
  const lum1 = luminance(hexToRgb(hex1));
  const lum2 = luminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

console.log("White on Navy (#ffffff on #0B2265): " + contrastRatio('#ffffff', '#0B2265').toFixed(2));
console.log("White on Gold (#ffffff on #c8a96e): " + contrastRatio('#ffffff', '#c8a96e').toFixed(2));
console.log("Navy on Gold (#0B2265 on #c8a96e): " + contrastRatio('#0B2265', '#c8a96e').toFixed(2));
