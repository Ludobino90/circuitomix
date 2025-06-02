const mongoose = require('mongoose');

const destaqueSchema = new mongoose.Schema({
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
  link: {
    type: String,
    default: ''
  },
  data: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Destaque', destaqueSchema);