const fs = require('fs');
const content = fs.readFileSync('script.js', 'utf-8');
const lines = content.split('\n');

// Encontrar a linha de DOMContentLoaded
const domStartLine = lines.findIndex(l => l.includes("document.addEventListener('DOMContentLoaded'"));
console.log('DOMContentLoaded começa na linha:', domStartLine + 1);

// Mostrar as próximas 40 linhas
console.log('\n=== Primeiras 40 linhas do DOMContentLoaded ===');
for (let i = domStartLine; i < Math.min(domStartLine + 40, lines.length); i++) {
    const lineNum = i + 1;
    const line = lines[i];
    console.log(lineNum + ': ' + line);
}
