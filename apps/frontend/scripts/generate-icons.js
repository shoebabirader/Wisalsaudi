// Simple script to generate placeholder PWA icons
// In production, these should be replaced with actual branded icons

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1E40AF"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">W</text>
</svg>`;
}

// Generate icons
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  
  // Save as SVG (browsers can use SVG as icons)
  fs.writeFileSync(path.join(publicDir, svgFilename), svg);
  console.log(`Generated ${svgFilename}`);
});

// Generate maskable icons (same as regular for now)
[192, 512].forEach(size => {
  const svg = createSVGIcon(size);
  const svgFilename = `icon-maskable-${size}x${size}.svg`;
  
  fs.writeFileSync(path.join(publicDir, svgFilename), svg);
  console.log(`Generated ${svgFilename}`);
});

console.log('Icon generation complete!');
console.log('Note: SVG icons are generated. For production, convert to PNG using a tool like sharp or imagemagick.');
