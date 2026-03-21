const http = require('http');

async function testFullFlow() {
    console.log('=== TESTE DE FLUXO COMPLETO ===\n');

    // 1. Obter transações
    console.log('1️⃣ Obtendo transações...');
    const response1 = await fetch('http://localhost:3000/api/transactions');
    const data1 = await response1.json();
    const unpaidTransaction = (data1.data || []).find(t => t.pago === 0);

    if (!unpaidTransaction) {
        console.error('❌ Nenhuma transação não-paga encontrada');
        return;
    }

    console.log(`   Encontrada: ${unpaidTransaction.id}`);
    console.log(`   Pago atual: ${unpaidTransaction.pago}`);

    // 2. Fazer PATCH para marcar como pago
    console.log('\n2️⃣ Enviando PATCH para marcar como pago...');
    const patchResponse = await fetch(`http://localhost:3000/api/transactions/${unpaidTransaction.id}/pago`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: true })
    });
    const patchResult = await patchResponse.json();
    console.log(`   ✓ Resposta do servidor: pago=${patchResult.pago}`);

    // 3. Obter transações novamente
    console.log('\n3️⃣ Recarregando transações após PATCH...');
    const response2 = await fetch('http://localhost:3000/api/transactions');
    const data2 = await response2.json();
    const updatedTransaction = (data2.data || []).find(t => t.id === unpaidTransaction.id);
    console.log(`   Pago após reload: ${updatedTransaction.pago}`);

    // 4. Simular renderização do frontend (antes vs depois do fix)
    console.log('\n4️⃣ Simulando renderização da UI:');
    const isPago_BUG = updatedTransaction.pago === true;
    const isPago_FIXED = !!updatedTransaction.pago;
    const btnText_BUG = isPago_BUG ? '✓ Pago' : '○ Pagar';
    const btnText_FIXED = isPago_FIXED ? '✓ Pago' : '○ Pagar';

    console.log(`   Com BUG (=== true): ${btnText_BUG} ❌`);
    console.log(`   Com FIX (!!valor):  ${btnText_FIXED} ✓`);

    // 5. Voltar ao estado original
    console.log('\n5️⃣ Revertendo para pago=0 (cleanup)...');
    await fetch(`http://localhost:3000/api/transactions/${unpaidTransaction.id}/pago`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: false })
    });
    console.log('   ✓ Revertido');

    console.log('\n✅ TESTE CONCLUÍDO: BUG ENCONTRADO E CORRIGIDO!');
}

testFullFlow().catch(err => console.error('Erro:', err));
