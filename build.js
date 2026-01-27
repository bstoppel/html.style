const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Read partials
const headerPartial = fs.readFileSync('src/partials/header.html', 'utf8');

// Process each HTML file in src/
const srcFiles = fs.readdirSync('src').filter(file => file.endsWith('.html'));
srcFiles.forEach(file => {
  let content = fs.readFileSync(path.join('src', file), 'utf8');
  
  // Replace web component tags with partials
  content = content.replace(/<site-header>[\s\S]*?<\/site-header>/g, headerPartial);

  // Strip <slot> tags, keeping only their default content
  // <slot name="...">default content</slot> becomes just "default content"
  content = content.replace(/<slot[^>]*>([\s\S]*?)<\/slot>/g, '$1');

  // Write to dist/
  fs.writeFileSync(path.join('dist', file), content);
});

console.log('Build complete: Partials replaced in dist/');