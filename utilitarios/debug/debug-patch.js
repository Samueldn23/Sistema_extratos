// Test: Mudar status e verificar imediatamente
const http = require('http');

const getTransaction = (id) => {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000/api/transactions/${id}`, (res) => {
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

(async () => {
    console.log('🔧 TESTE DE PERSISTÊNCIA - MAIS DETALHADO\n');

    // Get all transactions
    const allTrans = await getTransactions();
    const transactions = Array.isArray(allTrans) ? allTrans : (allTrans.data || []);

    // Find a transaction with pago = 0
    const testTrans = transactions.find(t => t.pago === 0 || t.pago === false);

    if (!testTrans) {
        console.log('❌ Nenhuma transação com pago=0 encontrada');
        return;
    }

    console.log(`📍 Testando transação: ${testTrans.id}`);
    console.log(`   DESC: ${testTrans.DESCRIÇÃO}`);
    console.log(`   Status INICIAL no GET: pago = ${testTrans.pago}\n`);

    // Get detailed info about this transaction
    console.log('1️⃣ Fazendo GET específico da transação...');
    const detail1 = await getTransaction(testTrans.id);
    console.log(`   Resposta: ${JSON.stringify(detail1)}\n`);

    // Update to true
    console.log('2️⃣ Enviando PATCH com pago = true');
    const patchResult = await updatePayment(testTrans.id, true);
    console.log(`   Resposta: ${JSON.stringify(patchResult)}\n`);

    // Immediately check with GET (same transaction)
    console.log('3️⃣ Fazendo GET específico LOGO APÓS PATCH');
    const detail2 = await getTransaction(testTrans.id);
    console.log(`   Resposta: ${JSON.stringify(detail2)}`);
    console.log(`   pago = ${detail2 ? detail2.pago : 'ERROR'}\n`);

    // Check in full list
    console.log('4️⃣ Fazendo GET DE TODAS AS TRANSAÇÕES');
    const allTrans2 = await getTransactions();
    const transactions2 = Array.isArray(allTrans2) ? allTrans2 : (allTrans2.data || []);
    const testTrans2 = transactions2.find(t => t.id === testTrans.id);
    console.log(`   Encontrada: ${testTrans2 ? 'SIM' : 'NÃO'}`);
    if (testTrans2) {
        console.log(`   pago = ${testTrans2.pago}\n`);
    }

    // Verify
    if (detail2 && detail2.pago === 1 && testTrans2 && testTrans2.pago === 1) {
        console.log('✅ SUCESSO! Status foi persistido corretamente!');
    } else {
        console.log('❌ FALHA! Status NÃO foi persistido!');
        console.log(`   Esperado: pago = 1`);
        console.log(`   GET específico retornou: ${detail2 ? detail2.pago : 'null'}`);
        console.log(`   GET geral retornou: ${testTrans2 ? testTrans2.pago : 'não encontrado'}`);
    }
})();
