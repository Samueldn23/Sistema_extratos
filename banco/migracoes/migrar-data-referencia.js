const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sistema_extratos.db');

console.log('🔄 Executando migração para adicionar data_referencia...\n');

// Verificar se a coluna já existe
db.all("PRAGMA table_info(transacoes)", (err, columns) => {
    if (err) {
        console.error('❌ Erro ao verificar estrutura da tabela:', err);
        db.close();
        return;
    }

    const hasDataReferencia = columns.some(col => col.name === 'data_referencia');

    if (hasDataReferencia) {
        console.log('✓ Coluna data_referencia já existe');
        db.close();
        return;
    }

    console.log('➕ Adicionando coluna data_referencia...');

    db.run(`ALTER TABLE transacoes ADD COLUMN data_referencia TEXT`, function(err) {
        if (err) {
            console.error('❌ Erro ao adicionar coluna:', err);
            db.close();
            return;
        }

        console.log('✓ Coluna adicionada com sucesso');

        // Preencher data_referencia com DATA para registros existentes
        console.log('🔄 Preenchendo data_referencia com valores de DATA...');
        db.run(`UPDATE transacoes SET data_referencia = DATA WHERE data_referencia IS NULL`, function(err) {
            if (err) {
                console.error('❌ Erro ao preencher dados:', err);
            } else {
                console.log(`✓ ${this.changes} registros atualizados`);
            }

            db.close();
            console.log('\n✅ Migração concluída com sucesso!');
        });
    });
});
