const app = require('./index');
const path = require('path');

// Copiar todas as rotas do servidor original
require(path.join(__dirname, '..', 'src', 'servidor.js'));

module.exports = app;
