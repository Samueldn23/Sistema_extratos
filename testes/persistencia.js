const http = require('http');

async function testPersistence() {
    console.log('🧪 TESTE DE PERSISTÊNCIA DE PAGAMENTO\n');

    try {
        // 1. Buscar primeira transação não-paga
        const res1 = await fetch('http://localhost:3000/api/transactions');
        const { data } = await res1.json();
        const transacao = data.find(t => t.pago === 0);

        if (!transacao) {
            console.log('❌ Sem transações não-pagas para testar');
            return;
        }

        console.log(`📝 Transação: ${transacao.id}`);
        console.log(`💰 Valor: ${transacao.VALOR}`);
        console.log(`📅 Data: ${transacao.DATA}`);
        console.log(`❌ Estado atual: Não pago (pago=${transacao.pago})\n`);

        // 2. Marcar como pago
        console.log('▶️  Enviando comando: Marcar como PAGO...');
        const res2 = await fetch(`http://localhost:3000/api/transactions/${transacao.id}/pago`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pago: true })
        });
        const result = await res2.json();
        console.log(`✓  Servidor respondeu: pago=${result.pago}\n`);

        // 3. Verificar persistência (carregar novamente)
        console.log('🔄 Verificando persistência no banco de dados...');
        const res3 = await fetch('http://localhost:3000/api/transactions');
        const { data: data2 } = await res3.json();
        const transacaoAtualizada = data2.find(t => t.id === transacao.id);

        console.log(`✅ Estado no banco: pago=${transacaoAtualizada.pago}`);
        console.log(`   Descrição: "${transacaoAtualizada.DESCRIÇÃO}"`);
        console.log(`   Atualizado em: ${transacaoAtualizada.atualizado_em}\n`);

        // 4. Testar lógica de renderização
        console.log('🎨 Testando renderização da UI:');
        const isPago_BUG = transacaoAtualizada.pago === true;      // ERRADO
        const isPago_FIXED = !!transacaoAtualizada.pago;           // CORRETO

        console.log(`   ❌ Com BUG (=== true): ${isPago_BUG ? '✓ Pago' : '○ Pagar'}`);
        console.log(`   ✅ Com FIX (!! valor): ${isPago_FIXED ? '✓ Pago' : '○ Pagar'}\n`);

        // 5. Revert
        console.log('🔙 Limpando (revertendo para não-pago)...');
        await fetch(`http://localhost:3000/api/transactions/${transacao.id}/pago`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pago: false })
        });
        console.log('✓  Revertido\n');

        console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('➡️  Agora teste no navegador: abra F12 → Console para ver logs');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testPersistence();
