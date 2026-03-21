// Find unmatched braces
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
const code = fs.readFileSync(scriptPath, 'utf8');
const lines = code.split('\n');

let braceCount = 0;
let problemLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;

    braceCount += opens - closes;

    // Log lines with unbalanced braces
    if (opens !== closes) {
        problemLines.push({
            line: i + 1,
            content: line.trim(),
            opens,
            closes,
            balance: braceCount
        });
    }

    // If balance goes negative, we have extra closing braces
    if (braceCount < 0) {
        console.log(`❌ EXTRA CLOSING BRACE at line ${i + 1}:`);
        console.log(`   "${line.trim()}"`);
        console.log(`   Running balance: ${braceCount}`);
    }
}

console.log('\nFinal brace count:', braceCount);
if (braceCount > 0) {
    console.log('❌ Missing closing braces');
} else if (braceCount < 0) {
    console.log('❌ Extra closing braces');
} else {
    console.log('✅ Braces are balanced');
}
