const http = require('http');

async function testDataReferencia() {
    console.log('🧪 TESTE: Data de Referência\n');

    try {
        // 1. Criar transação com data_referencia diferente de DATA
        console.log('1️⃣  Criando transação...');
        const newTransaction = {
            id: `test_${Date.now()}`,
            DATA: '2026-02-02T00:00:00', // Depósito em fevereiro
            DESCRIÇÃO: 'DEPOSITO JANEIRO',
            VALOR: 1000,
            CATEGORIA: 'Receita',
            pago: false,
            data_referencia: '2026-01-31T00:00:00' // Mas referente a janeiro
        };

        const res1 = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction)
        });

        const created = await res1.json();
        const transactionId = created.transaction.id;
        console.log(`   ✓ Criado: ${transactionId}`);
        console.log(`   DATA: ${newTransaction.DATA}`);
        console.log(`   data_referencia: ${newTransaction.data_referencia}\n`);

        // 2. Recuperar e verificar
        console.log('2️⃣  Verificando se foi salvo corretamente...');
        const res2 = await fetch('http://localhost:3000/api/transactions');
        const data = await res2.json();
        const retrieved = data.data.find(t => t.id === transactionId);

        if (retrieved) {
            console.log(`   ✓ DATA: ${retrieved.DATA}`);
            console.log(`   ✓ data_referencia: ${retrieved.data_referencia}\n`);
        }

        // 3. Verificar filtro em janeiro (deveria aparecer)
        console.log('3️⃣  Testando filtro por mês...');
        const janTransactions = data.data.filter(t => {
            const dateToUse = t.data_referencia || t.DATA;
            const date = new Date(dateToUse);
            return date.getMonth() === 0 && date.getFullYear() === 2026; // Janeiro 2026
        });

        const found = janTransactions.some(t => t.id === transactionId);
        console.log(`   Encontrado em Janeiro: ${found ? '✓ SIM' : '❌ NÃO'}\n`);

        // 4. Verificar filtro em fevereiro (NÃO deveria aparecer com data_referencia)
        console.log('4️⃣  Testando filtro de fevereiro...');
        const febTransactions = data.data.filter(t => {
            const dateToUse = t.data_referencia || t.DATA;
            const date = new Date(dateToUse);
            return date.getMonth() === 1 && date.getFullYear() === 2026; // Fevereiro 2026
        });

        const notFound = !febTransactions.some(t => t.id === transactionId);
        console.log(`   NÃO encontrado em Fevereiro: ${notFound ? '✓ SIM (correto)' : '❌ NÃO (erro!)'}\n`);

        // 5. Limpar
        console.log('5️⃣  Limpando (removendo transação de teste)...');
        await fetch(`http://localhost:3000/api/transactions/${transactionId}`, {
            method: 'DELETE'
        });
        console.log('   ✓ Removido\n');

        if (found && notFound) {
            console.log('✅ TESTE PASSOU: Data de Referência funcionando corretamente!');
        } else {
            console.log('❌ TESTE FALHOU: Verifique a implementação');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testDataReferencia();
