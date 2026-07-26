const express = require('express');
const path = require('path');

const app = express();

// Servir arquivos estáticos da pasta publico
app.use(express.static(path.join(__dirname, '..', 'publico')));

// Rota principal - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'publico', 'index.html'));
});

// Importar e usar as rotas do servidor
const serverPath = path.join(__dirname, '..', 'src', 'servidor.js');

// Re-exportar como serverless function
module.exports = app;

// Se rodando localmente, iniciar servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
