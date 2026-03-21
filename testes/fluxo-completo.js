// Simular clique no botão de pagar
const http = require('http');
const readline = require('readline');

const getTransactions = () => {
    return new Promise((resolve) => {
        http.get('http://localhost:3000/api/transactions', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        });
    });
};

const updatePayment = (id, pago) => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ pago });
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/transactions/${id}/pago`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.write(postData);
        req.end();
    });
};

(async () => {
    console.log('🧪 TESTE COMPLETO DE PERSISTÊNCIA DE PAGAMENTO\n');

    // Get transactions
    const resp1 = await getTransactions();
    if (!resp1) {
        console.log('❌ Erro ao conectar à API');
        return;
    }

    const transactions = Array.isArray(resp1) ? resp1 : (resp1.data || []);
    const expense = transactions.find(t => parseFloat(t.VALOR) < 0);

    if (!expense) {
        console.log('❌ Nenhuma despesa encontrada');
        return;
    }

    console.log(`📊 Testando transação:`);
    console.log(`   ID: ${expense.id}`);
    console.log(`   Descrição: ${expense.DESCRIÇÃO}`);
    console.log(`   Valor: ${expense.VALOR}`);
    console.log(`   Status inicial: pago = ${expense.pago}\n`);

    // Simular clique do usuário (alternar status)
    console.log(`👆 SIMULANDO CLIQUE DO USUÁRIO`);
    const newStatus = !expense.pago;
    console.log(`   Enviando: pago = ${newStatus}`);

    const patchResult = await updatePayment(expense.id, newStatus);
    console.log(`   Resposta do servidor: ${JSON.stringify(patchResult)}\n`);

    // Simular recarregamento da página
    console.log(`🔄 SIMULANDO F5 (RECARREGAR PÁGINA)`);
    console.log(`   Buscando transações novamente...\n`);

    const resp2 = await getTransactions();
    const transactions2 = Array.isArray(resp2) ? resp2 : (resp2.data || []);
    const expenseAfter = transactions2.find(t => t.id === expense.id);

    console.log(`📊 Status após recarregar:`);
    console.log(`   pago = ${expenseAfter.pago}`);
    console.log(`   Esperado: ${newStatus ? 1 : 0}\n`);

    if (expenseAfter.pago === (newStatus ? 1 : 0)) {
        console.log('✅ SUCESSO! A persistência está funcionando!\n');

        // Test toggle back
        console.log(`👆 TESTANDO TOGGLE DE VOLTA`);
        const toggleBack = !expenseAfter.pago;
        console.log(`   Enviando: pago = ${toggleBack}`);

        const patchResult2 = await updatePayment(expenseAfter.id, toggleBack);
        console.log(`   Resposta: ${JSON.stringify(patchResult2)}\n`);

        const resp3 = await getTransactions();
        const transactions3 = Array.isArray(resp3) ? resp3 : (resp3.data || []);
        const expenseBack = transactions3.find(t => t.id === expense.id);

        console.log(`📊 Status após toggle de volta:`);
        console.log(`   pago = ${expenseBack.pago}`);
        console.log(`   Esperado: ${toggleBack ? 1 : 0}\n`);

        if (expenseBack.pago === (toggleBack ? 1 : 0)) {
            console.log('✅ TODOS OS TESTES PASSARAM!');
        } else {
            console.log('❌ Falha no toggle de volta');
        }
    } else {
        console.log(`❌ FALHA! Status não foi persistido!`);
        console.log(`   Esperado: ${newStatus ? 1 : 0}, Recebido: ${expenseAfter.pago}`);
    }
})();
