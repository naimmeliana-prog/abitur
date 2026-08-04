// Script to copy favicon image from internal store to the workspace assets directory
const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\USUARIO\\.gemini\\antigravity-ide\\brain\\4a802485-4b28-43da-8991-0b1a999885b6\\favicon_1785875962214.png';
const dest = path.join(__dirname, '..', 'assets', 'favicon.png');

try {
  fs.copyFileSync(src, dest);
  console.log('Favicon copied successfully to:', dest);
} catch (err) {
  console.error('Error copying favicon:', err);
  process.exit(1);
}
