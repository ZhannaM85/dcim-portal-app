const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const uiKitRoot = path.resolve(__dirname, '..', '..', 'ui-kit');
const uiKitDist = path.join(uiKitRoot, 'dist', 'ui-kit');
const targetDir = path.resolve(__dirname, '..', 'node_modules', '@zhannam85', 'ui-kit');

// Step 1: Build ui-kit
console.log('Building ui-kit...');
execSync('npm run build', { cwd: uiKitRoot, stdio: 'inherit' });

// Step 2: Clear the existing contents in node_modules
console.log(`\nReplacing files in ${targetDir}...`);
if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Step 3: Copy fresh build output into node_modules
copyDirSync(uiKitDist, targetDir);

console.log('\nDone! ui-kit rebuilt and copied to node_modules.');

function copyDirSync(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
