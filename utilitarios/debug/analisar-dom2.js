const fs = require('fs');
const content = fs.readFileSync('script.js', 'utf-8');
const lines = content.split('\n');

// Encontrar a linha de DOMContentLoaded
const domStartLine = lines.findIndex(l => l.includes("document.addEventListener('DOMContentLoaded'"));
const domEndLine = lines.length - 1; // Último evento é fechar });

console.log('DOMContentLoaded: linhas', domStartLine + 1, 'até', domEndLine + 1);
console.log('\nProcurando por "allTransactions" dentro do DOMContentLoaded...\n');

for (let i = domStartLine; i <= domEndLine; i++) {
    const line = lines[i];
    if (line.includes('allTransactions') || line.includes('loadAllTransactions()')) {
        console.log((i + 1) + ': ' + line.trim());
    }
}

console.log('\nProcurando por "displayTransactions()" no início do DOMContentLoaded...\n');
for (let i = domStartLine; i < Math.min(domStartLine + 20, domEndLine); i++) {
    const line = lines[i];
    console.log((i + 1) + ': ' + line);
}
