const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    maxlength: 80
  },
  conteudo: {
    type: String,
    required: true,
    maxlength: 1500
  },
  midia: {
    type: String,
    validate: {
      validator: v => /\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(v),
      message: "Formato de arquivo inválido!"
    }
  },
  data: { 
    type: Date, 
    default: Date.now 
  },
  link: {
  type: String,
  default: ''
}
});

module.exports = mongoose.model('Noticia', noticiaSchema);