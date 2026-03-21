const http = require('http');

async function simulateBrowserBehavior() {
    console.log('🌐 SIMULANDO COMPORTAMENTO DO NAVEGADOR\n');

    try {
        // ETAPA 1: Usuário abre a página (loadAllTransactions)
        console.log('1️⃣  PÁGINA ABERTA: Carregando transações...');
        const res1 = await fetch('http://localhost:3000/api/transactions');
        const data1 = await res1.json();

        let tomaTransaction = data1.data.find(t => t.DESCRIÇÃO.includes('TOMA') && t.pago === 0);
        if (!tomaTransaction) {
            tomaTransaction = data1.data.find(t => t.pago === 0);
        }

        console.log(`   ID: ${tomaTransaction.id}`);
        console.log(`   Desc: ${tomaTransaction.DESCRIÇÃO}`);
        console.log(`   Status ANTES: pago = ${tomaTransaction.pago}\n`);

        // ETAPA 2: Usuário clica no botão "Pagar"
        console.log('2️⃣  CLIQUE EM BOTÃO: Enviando PATCH...');
        const newStatus = !tomaTransaction.pago; // Inverte 0 → 1
        console.log(`   Enviando: pago = ${newStatus} (tipo: ${typeof newStatus})`);

        const patchRes = await fetch(
            `http://localhost:3000/api/transactions/${tomaTransaction.id}/pago`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pago: newStatus })
            }
        );
        const patchData = await patchRes.json();
        console.log(`   ✓ Resposta do servidor: ${JSON.stringify(patchData)}\n`);

        // ETAPA 3: Simular displayTransactions (renderizar tabela)
        console.log('3️⃣  RENDERIZANDO: displayTransactions()');
        console.log('   (Simulando lógica de renderização)\n');

        // ETAPA 4: Usuário recarrega a página (F5)
        console.log('4️⃣  RECARREGAR PÁGINA: F5');
        console.log('   Aguardando 1 segundo...');
        await new Promise(r => setTimeout(r, 1000));

        const res2 = await fetch('http://localhost:3000/api/transactions');
        const data2 = await res2.json();
        const reloadedTransaction = data2.data.find(t => t.id === tomaTransaction.id);

        console.log(`   Status DEPOIS: pago = ${reloadedTransaction.pago}`);
        console.log(`   Tipo: ${typeof reloadedTransaction.pago}\n`);

        // ETAPA 5: Verificar lógica de renderização
        console.log('5️⃣  VERIFICAR RENDERIZAÇÃO:');
        const isPago_OLD = reloadedTransaction.pago === true; // BUG!
        const isPago_NEW = !!reloadedTransaction.pago;         // FIX!

        console.log(`   ❌ BUG (=== true): ${isPago_OLD ? '✓ Pago' : '○ Pagar'}`);
        console.log(`   ✅ FIX (!!valor):  ${isPago_NEW ? '✓ Pago' : '○ Pagar'}\n`);

        // Resultado final
        if (isPago_NEW && reloadedTransaction.pago === 1) {
            console.log('✅ TESTE PASSOU: Persistência funcionando!');
        } else {
            console.log('❌ TESTE FALHOU: Algo está errado');
        }

        // Limpar
        console.log('\n🔙 Limpando (revertendo)...');
        await fetch(
            `http://localhost:3000/api/transactions/${tomaTransaction.id}/pago`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pago: false })
            }
        );
        console.log('✓  Revertido');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error);
    }
}

simulateBrowserBehavior();
