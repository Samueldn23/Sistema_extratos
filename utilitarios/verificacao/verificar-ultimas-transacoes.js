const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sistema_extratos.db');

db.all("SELECT id, DATA, data_referencia FROM transacoes ORDER BY criado_em DESC LIMIT 5", (err, rows) => {
    if (err) {
        console.error('Erro:', err);
        db.close();
        return;
    }

    console.log('Últimas 5 transações:');
    rows.forEach(row => {
        console.log(`  ID: ${row.id}`);
        console.log(`    DATA: ${row.DATA}`);
        console.log(`    data_referencia: ${row.data_referencia}`);
        console.log();
    });

    db.close();
});
