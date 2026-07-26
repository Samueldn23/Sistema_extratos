const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir arquivos estáticos da pasta publico
app.use(express.static(path.join(__dirname, '..', 'publico')));

// Importar as rotas do servidor original
require(path.join(__dirname, '..', 'src', 'servidor.js'));

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'publico', 'index.html'));
});

module.exports = app;
