const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

// Check if we can build (typescript available)
try {
  require.resolve('typescript');
} catch (e) {
  // No devDeps - check if dist exists (npm install from registry)
  if (fs.existsSync(distPath)) {
    console.log('Skipping build - dist already exists');
    process.exit(0);
  }
  console.error('\n========================================');
  console.error('  Building from git requires devDependencies.');
  console.error('  Run: npm install --include=dev');
  console.error('========================================\n');
  process.exit(1);
}

// DevDeps available - run full build
console.log('Building venom-bot...');
execSync('npm run clean && npm run build', { stdio: 'inherit' });
