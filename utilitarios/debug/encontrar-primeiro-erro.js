// Find the exact line where extra braces start
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
const code = fs.readFileSync(scriptPath, 'utf8');
const lines = code.split('\n');

let braceCount = 0;
let firstNegativeLine = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;

    braceCount += opens - closes;

    // Track the first time we go negative
    if (braceCount < 0 && firstNegativeLine === null) {
        firstNegativeLine = i;
        console.log(`❌ FIRST EXTRA CLOSING BRACE at line ${i + 1}`);
        console.log(`Balance goes from ${braceCount + closes - opens} to ${braceCount}`);
        console.log('');

        // Show context
        const start = Math.max(0, i - 5);
        const end = Math.min(lines.length - 1, i + 5);

        for (let j = start; j <= end; j++) {
            const prefix = j === i ? '>>> ' : '    ';
            console.log(`${prefix}${(j + 1).toString().padStart(4)}: ${lines[j]}`);
        }

        break;
    }
}

if (firstNegativeLine === null) {
    console.log('✅ No extra closing braces found at the beginning');
}
