const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  midia: String,
  data: { type: Date, default: Date.now }
});

// Remove modelo anterior se já existir
delete mongoose.connection.models['Evento'];

module.exports = mongoose.model('Evento', eventoSchema);
