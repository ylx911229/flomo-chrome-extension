const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../.next');
const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files from public
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Function to update HTML file references from _next to next
function updateHtmlReferences(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace _next with next in all references
  content = content.replace(/_next\//g, 'next/');
  fs.writeFileSync(filePath, content);
}

// Copy public files
copyDir(publicDir, distDir);

// Copy built HTML files from Next.js output and update references
const htmlFiles = ['popup.html', 'options.html'];
htmlFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    updateHtmlReferences(destPath);
  }
});

// Copy static assets but rename _next to next
const staticDir = path.join(srcDir, 'static');
const distStaticDir = path.join(distDir, 'next', 'static'); // Changed from _next to next
if (fs.existsSync(staticDir)) {
  copyDir(staticDir, distStaticDir);
}

// Also copy chunks if they exist
const chunksDir = path.join(srcDir, 'static', 'chunks');
const distChunksDir = path.join(distDir, 'next', 'static', 'chunks');
if (fs.existsSync(chunksDir)) {
  copyDir(chunksDir, distChunksDir);
}

console.log('Extension build completed!');