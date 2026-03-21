// Test payment status toggle
const http = require('http');

// Get transactions first
const getTransactions = () => {
    return new Promise((resolve) => {
        http.get('http://localhost:3000/api/transactions', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        });
    });
};

// Update payment status
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
                resolve(JSON.parse(data));
            });
        });

        req.write(postData);
        req.end();
    });
};

// Run test
(async () => {
    console.log('📝 Testando funcionalidade de pagamento...\n');

    // Get first transaction
    const response = await getTransactions();
    console.log('Tipo de resposta:', typeof response);
    console.log('É array?', Array.isArray(response));
    console.log('Keys:', Object.keys(response).slice(0, 5));

    // Handle case where response has data wrapper
    const transactions = Array.isArray(response) ? response : (response.data || []);
    const testTrans = transactions.find(t => parseFloat(t.VALOR) < 0); // Get first expense

    if (!testTrans) {
        console.log('❌ Nenhuma despesa encontrada');
        return;
    }

    console.log(`ID: ${testTrans.id}`);
    console.log(`Descrição: ${testTrans.DESCRIÇÃO}`);
    console.log(`Status ANTES: pago = ${testTrans.pago}\n`);

    // Update to true
    console.log('Enviando: pago = true');
    const result1 = await updatePayment(testTrans.id, true);
    console.log(`Resposta: ${JSON.stringify(result1)}\n`);

    // Verify
    const updated1Resp = await getTransactions();
    const updated1 = Array.isArray(updated1Resp) ? updated1Resp : (updated1Resp.data || []);
    const check1 = updated1.find(t => t.id === testTrans.id);
    console.log(`Status APÓS UPDATE 1: pago = ${check1.pago}\n`);

    // Update to false
    console.log('Enviando: pago = false');
    const result2 = await updatePayment(testTrans.id, false);
    console.log(`Resposta: ${JSON.stringify(result2)}\n`);

    // Verify
    const updated2Resp = await getTransactions();
    const updated2 = Array.isArray(updated2Resp) ? updated2Resp : (updated2Resp.data || []);
    const check2 = updated2.find(t => t.id === testTrans.id);
    console.log(`Status APÓS UPDATE 2: pago = ${check2.pago}\n`);

    if (check1.pago === 1 && check2.pago === 0) {
        console.log('✅ SUCESSO! Status de pagamento está funcionando corretamente');
    } else {
        console.log('❌ FALHA! Status não mudou como esperado');
    }
})();
