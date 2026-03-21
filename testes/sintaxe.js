// Test to verify script.js has no syntax errors
const fs = require('fs');
const path = require('path');

try {
    const scriptPath = path.join(__dirname, 'script.js');
    const code = fs.readFileSync(scriptPath, 'utf8');

    // Try to parse as valid JavaScript by creating a function
    new Function(code);

    console.log('✅ script.js has valid JavaScript syntax');
    console.log(`📊 Total characters: ${code.length}`);
    console.log(`📊 Function definitions: ${(code.match(/^function /gm) || []).length}`);
    console.log(`📊 DOMContentLoaded listeners: ${(code.match(/DOMContentLoaded/g) || []).length}`);

    process.exit(0);
} catch (error) {
    console.error('❌ Syntax error in script.js:');
    console.error(error.message);
    process.exit(1);
}
