const http = require('http');

async function testDataReferencia() {
    console.log('🧪 TESTE DEBUG: Data de Referência\n');

    try {
        // 1. Criar transação
        console.log('1️⃣  Criando transação...');
        const newTransaction = {
            id: `test_debug_${Date.now()}`,
            DATA: '2026-02-02T00:00:00',
            DESCRIÇÃO: 'TESTE_DEBUG_REFERENCIA',
            VALOR: 1000,
            CATEGORIA: 'Receita',
            pago: false,
            data_referencia: '2026-01-31T00:00:00'
        };

        console.log('Enviando:', JSON.stringify(newTransaction, null, 2));

        const res1 = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction)
        });

        const created = await res1.json();
        console.log('\nResposta do servidor:', JSON.stringify(created, null, 2));

        // 2. Recuperar
        await new Promise(r => setTimeout(r, 500)); // Aguardar 500ms

        console.log('\n2️⃣  Recuperando...');
        const res2 = await fetch('http://localhost:3000/api/transactions');
        const data = await res2.json();
        const retrieved = data.data.find(t => t.DESCRIÇÃO === 'TESTE_DEBUG_REFERENCIA');

        if (retrieved) {
            console.log('Recuperado:', JSON.stringify(retrieved, null, 2));
        } else {
            console.log('❌ Transação não encontrada!');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testDataReferencia();
