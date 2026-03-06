const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create subdirectories if they don't exist
const cjsDir = path.join(distDir, 'cjs');
const esmDir = path.join(distDir, 'esm');
if (!fs.existsSync(cjsDir)) {
  fs.mkdirSync(cjsDir, { recursive: true });
}
if (!fs.existsSync(esmDir)) {
  fs.mkdirSync(esmDir, { recursive: true });
}

// Create CommonJS wrapper
const cjsWrapper = `'use strict';

module.exports = require('./cjs/index.js');
`;

// Create ESM wrapper
const esmWrapper = `export * from './esm/index.js';
export { default } from './esm/index.js';
`;

// Create TypeScript definitions wrapper
const dtsWrapper = `export * from './esm/index';
export { default } from './esm/index';
`;

// Create package.json markers to enforce correct module resolution
const cjsPackageJson = JSON.stringify({ type: 'commonjs' }, null, 2) + '\n';
const esmPackageJson = JSON.stringify({ type: 'module' }, null, 2) + '\n';

// Write wrapper files
fs.writeFileSync(path.join(distDir, 'index.cjs'), cjsWrapper);
fs.writeFileSync(path.join(distDir, 'index.mjs'), esmWrapper);
fs.writeFileSync(path.join(distDir, 'index.d.ts'), dtsWrapper);

// Write module type markers
fs.writeFileSync(path.join(cjsDir, 'package.json'), cjsPackageJson);
fs.writeFileSync(path.join(esmDir, 'package.json'), esmPackageJson);

console.log('Wrapper files and module markers created successfully');
