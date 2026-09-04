# Favicon Generation Guide

The `favicon.svg` file includes modern features like OKLCH colors and dark mode support. To generate PNG fallbacks for broader compatibility, use one of these methods:

## Option 1: Using Sharp (Node.js)

```bash
npm install sharp
```

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 180, 192, 512];
const svg = fs.readFileSync('favicon.svg');

sizes.forEach(size => {
  sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`favicon-${size}x${size}.png`)
    .then(() => console.log(`Generated ${size}x${size}`));
});
```

## Option 2: Using ImageMagick

```bash
# 16x16 and 32x32 for favicon.ico
magick favicon.svg -resize 16x16 favicon-16x16.png
magick favicon.svg -resize 32x32 favicon-32x32.png

# Apple touch icon
magick favicon.svg -resize 180x180 apple-touch-icon.png

# Android icons for PWA
magick favicon.svg -resize 192x192 android-chrome-192x192.png
magick favicon.svg -resize 512x512 android-chrome-512x512.png

# Combine into .ico file
magick favicon-16x16.png favicon-32x32.png favicon.ico
```

## Option 3: Using Inkscape

```bash
inkscape favicon.svg --export-filename=favicon-16x16.png -w 16 -h 16
inkscape favicon.svg --export-filename=favicon-32x32.png -w 32 -h 32
inkscape favicon.svg --export-filename=apple-touch-icon.png -w 180 -h 180
inkscape favicon.svg --export-filename=android-chrome-192x192.png -w 192 -h 192
inkscape favicon.svg --export-filename=android-chrome-512x512.png -w 512 -h 512
```

## Option 4: Online Tools

- [RealFaviconGenerator](https://realfavicongenerator.net/) - Upload SVG, generates all sizes
- [Favicon.io](https://favicon.io/) - Simple favicon generator

## Required Files

After generation, you should have:

```
src/
├── favicon.svg              # Modern browsers (with dark mode)
├── favicon.ico              # Legacy browsers (16x16, 32x32)
├── favicon-16x16.png        # Fallback
├── favicon-32x32.png        # Fallback
├── apple-touch-icon.png     # iOS (180x180)
├── android-chrome-192x192.png  # Android/PWA
└── android-chrome-512x512.png  # Android/PWA
```

## Dark Mode Note

The PNG files will render the light theme version. The SVG favicon automatically adapts to the user's color scheme preference in browsers that support SVG favicons (Chrome 80+, Firefox 41+, Safari 9+).
