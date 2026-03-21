const http = require('http');

async function checkDatabase() {
    try {
        // Verificar a coluna na tabela
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./sistema_extratos.db');

        db.all("PRAGMA table_info(transacoes)", (err, columns) => {
            if (err) {
                console.error('Erro:', err);
                return;
            }

            console.log('Colunas da tabela transacoes:');
            columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
            });

            db.close();
        });
    } catch (err) {
        console.error('Erro:', err);
    }
}

checkDatabase();
