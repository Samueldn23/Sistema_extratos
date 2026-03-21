const http = require('http');

http.get('http://localhost:3000/api/transactions', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Primeiro caractere:', data[0]);
        console.log('Tipo raiz:', data[0] === '[' ? 'ARRAY' : 'OBJECT');
        console.log('Primeiros 300 caracteres:');
        console.log(data.substring(0, 300));

        try {
            const parsed = JSON.parse(data);
            console.log('\n✅ JSON válido');
            console.log('Tipo:', Array.isArray(parsed) ? 'Array' : typeof parsed);
            if (Array.isArray(parsed)) {
                console.log('Quantidade de itens:', parsed.length);
            } else {
                console.log('Propriedades:', Object.keys(parsed));
            }
        } catch (e) {
            console.log('\n❌ JSON inválido:', e.message);
        }
    });
});
