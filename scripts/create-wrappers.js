const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create CommonJS wrapper
const cjsWrapper = `'use strict';

module.exports = require('./cjs/index.js');
`;

// Create ESM wrapper
const esmWrapper = `export * from './esm/index.js';
`;

// Create TypeScript definitions wrapper
const dtsWrapper = `export * from './esm/index';
`;

// Write wrapper files
fs.writeFileSync(path.join(distDir, 'index.cjs'), cjsWrapper);
fs.writeFileSync(path.join(distDir, 'index.js'), esmWrapper);
fs.writeFileSync(path.join(distDir, 'index.d.ts'), dtsWrapper);

console.log('✅ Wrapper files created successfully');