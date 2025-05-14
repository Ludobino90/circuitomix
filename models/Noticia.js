const mongoose = require('mongoose');

const NoticiaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  midia: String, // imagem ou vídeo
  dataPublicacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Noticia', NoticiaSchema);

const noticiaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  midia: String,
  data: { type: Date, default: Date.now }
});
const eventoSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  midia: String,
  data: { type: Date, default: Date.now }
});

const Noticia = mongoose.model('Noticia', noticiaSchema); // vai para coleção "noticias"
const Evento = mongoose.model('Evento', eventoSchema);    // vai para coleção "eventos"

