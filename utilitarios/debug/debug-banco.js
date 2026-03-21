// Debug: Verificar o estado atual do banco de dados
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'sistema_extratos.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando estado do banco de dados...\n');

// Get some transactions and check their pago status
db.all('SELECT id, DESCRIÇÃO, VALOR, pago FROM transacoes LIMIT 10', (err, rows) => {
    if (err) {
        console.error('Erro:', err);
        db.close();
        return;
    }

    console.log('📊 Primeiras 10 transações:');
    console.log('─'.repeat(80));
    rows.forEach((row, i) => {
        console.log(`${i+1}. ID: ${row.id}`);
        console.log(`   DESC: ${row.DESCRIÇÃO}`);
        console.log(`   VALOR: ${row.VALOR}`);
        console.log(`   PAGO: ${row.pago} (tipo: ${typeof row.pago})`);
        console.log('');
    });

    // Count by pago status
    db.all('SELECT pago, COUNT(*) as count FROM transacoes GROUP BY pago', (err, counts) => {
        if (err) {
            console.error('Erro:', err);
            db.close();
            return;
        }

        console.log('─'.repeat(80));
        console.log('📈 Distribuição de status pago:');
        counts.forEach(row => {
            console.log(`   pago = ${row.pago}: ${row.count} transações`);
        });

        db.close();
    });
});
