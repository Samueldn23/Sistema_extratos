const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

const envPath = path.join(__dirname, '..', '.env');
loadEnvFile(envPath);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Erro: SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos no arquivo .env.');
    process.exit(1);
}

const app = require('./index');

const preferredPort = Number(process.env.PORT) || 3000;

function printStartup(port) {
    console.log('');
    console.log('================================================');
    console.log('  SISTEMA DE EXTRATOS - DESENVOLVIMENTO LOCAL');
    console.log('================================================');
    console.log(`Frontend: http://localhost:${port}`);
    console.log(`API local: http://localhost:${port}/api`);
    console.log('Modo: API Vercel + pasta public + Supabase');
    console.log('');
}

function startServer(port, canFallback) {
    const server = app.listen(port, () => {
        printStartup(port);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && canFallback) {
            console.warn(`Porta ${port} em uso. Tentando porta 3001...`);
            startServer(3001, false);
            return;
        }

        if (error.code === 'EADDRINUSE') {
            console.error(`Erro: a porta ${port} ja esta em uso.`);
            console.error('Defina outra porta com a variavel PORT ou encerre o processo atual.');
            process.exit(1);
        }

        console.error('Erro ao iniciar servidor local:', error);
        process.exit(1);
    });
}

startServer(preferredPort, !process.env.PORT && preferredPort === 3000);
