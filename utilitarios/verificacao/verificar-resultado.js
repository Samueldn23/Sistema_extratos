const http = require('http');

http.get('http://localhost:3000/api/transactions', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        const result = parsed.data || parsed.transactions || [];

        console.log('Tipo de parsed:', typeof parsed);
        console.log('É array parsed?:', Array.isArray(parsed));
        console.log('Tipo de result:', typeof result);
        console.log('É array result?:', Array.isArray(result));
        console.log('Tamanho de result:', result.length);

        if (Array.isArray(result) && result.length > 0) {
            console.log('\nPrimeiro item:');
            console.log(JSON.stringify(result[0], null, 2).substring(0, 300));
        }
    });
});
