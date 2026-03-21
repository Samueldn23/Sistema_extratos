// Simular o problema e a solução

const transaction_pago = { pago: 1 };
const transaction_nao_pago = { pago: 0 };

console.log('=== BUG ORIGINAL ===');
console.log('pago=1, === true:', transaction_pago.pago === true); // false (BUG!)
console.log('pago=0, === true:', transaction_nao_pago.pago === true); // false

console.log('\n=== SOLUÇÃO (!!valor) ===');
console.log('pago=1, !!valor:', !!transaction_pago.pago); // true ✓
console.log('pago=0, !!valor:', !!transaction_nao_pago.pago); // false ✓

console.log('\n=== TESTE DE BOTÃO ===');
function getBtnText(isPago) {
    return isPago ? '✓ Pago' : '○ Pagar';
}

console.log('Com pago=1 e BUG: ' + getBtnText(transaction_pago.pago === true)); // "○ Pagar" (ERRADO)
console.log('Com pago=1 e FIX: ' + getBtnText(!!transaction_pago.pago)); // "✓ Pago" (CORRETO)
console.log('Com pago=0 e FIX: ' + getBtnText(!!transaction_nao_pago.pago)); // "○ Pagar" (CORRETO)
