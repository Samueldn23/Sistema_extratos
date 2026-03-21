const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sistema_extratos.db');

console.log('Procurando por transações de teste...\n');

db.all("SELECT id, DATA, data_referencia, DESCRIÇÃO FROM transacoes WHERE id LIKE 'test_%' ORDER BY criado_em DESC LIMIT 10", (err, rows) => {
    if (err) {
        console.error('Erro:', err);
        db.close();
        return;
    }

    if (rows.length === 0) {
        console.log('Nenhuma transação de teste encontrada');
    } else {
        console.log(`Encontradas ${rows.length} transações de teste:`);
        rows.forEach(row => {
            console.log(`\n  ID: ${row.id}`);
            console.log(`  DESCRIÇÃO: ${row.DESCRIÇÃO}`);
            console.log(`  DATA: ${row.DATA}`);
            console.log(`  data_referencia:${row.data_referencia === null ? ' (NULL)' : ' ' + row.data_referencia}`);
        });
    }

    db.close();
});
