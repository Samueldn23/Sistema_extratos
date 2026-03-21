// Add missing column to transacoes table
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'sistema_extratos.db');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(transacoes);", [], (err, rows) => {
    if (err) {
        console.error('Erro ao ler schema:', err);
        db.close();
        return;
    }

    console.log('Colunas atuais:');
    rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
    });

    // Check if atualizado_em column exists
    const hasColumn = rows.some(row => row.name === 'atualizado_em');

    if (!hasColumn) {
        console.log('\n✗ Coluna atualizado_em não encontrada. Adicionando...');

        db.run('ALTER TABLE transacoes ADD COLUMN atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
            if (err) {
                console.error('Erro ao adicionar coluna:', err);
            } else {
                console.log('✓ Coluna atualizado_em adicionada com sucesso!');
            }
            db.close();
        });
    } else {
        console.log('\n✓ Coluna atualizado_em já existe');
        db.close();
    }
});
