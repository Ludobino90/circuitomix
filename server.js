require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');

// Modelos
const Noticia = require('./models/Noticia');
const Evento = require('./models/Evento');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
const STREAM_URL = 'https://stream.zeno.fm/2zefp4qy0zzuv';
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Configurar diretórios
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// ======== AUTENTICAÇÃO ======== //
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Basic ')) {
    const token = authHeader.split(' ')[1];
    const senhaDecodificada = Buffer.from(token, 'base64').toString('utf-8');
    
    if (senhaDecodificada === process.env.ADMIN_PASSWORD) {
      return next();
    }
  }
  
  res.status(401).json({ error: 'Acesso não autorizado' });
};

// ======== ROTAS ======== //

// Login
// Modifique a rota de login para:
app.post('/api/login', (req, res) => {
  const { senha } = req.body; // Recebe a senha em texto puro
  
  console.log('Senha recebida:', senha);
  console.log('Senha esperada:', process.env.ADMIN_PASSWORD);

  if (senha === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Senha incorreta' });
  }
});

// Rotas CRUD para Notícias e Eventos
['noticias', 'eventos'].forEach(tipo => {
  const Model = tipo === 'noticias' ? Noticia : Evento;

  // Listar todos com tipo
  app.get(`/api/${tipo}`, async (req, res) => {
    try {
      const dados = await Model.find().sort({ data: -1 });
      const dadosComTipo = dados.map(item => ({
        ...item._doc,
        __tipo: tipo
      }));
      res.json(dadosComTipo);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  });

  // Criar
  app.post(`/api/${tipo}`, authenticate, upload.single('midia'), async (req, res) => {
    try {
      if (!req.body.titulo || !req.body.conteudo) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const novoItem = new Model({
        titulo: req.body.titulo,
        conteudo: req.body.conteudo,
        midia: req.file ? `/uploads/${req.file.filename}` : null
      });
      
      await novoItem.save();
      res.status(201).json(novoItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Buscar por ID
  app.get(`/api/${tipo}/:id`, async (req, res) => {
    try {
      const publicacao = await Model.findById(req.params.id);
      res.json(publicacao);
    } catch (error) {
      res.status(500).json({ error: 'Publicação não encontrada' });
    }
  });

  // Atualizar
  app.put(`/api/${tipo}/:id`, authenticate, upload.single('midia'), async (req, res) => {
    try {
      const updates = {
        titulo: req.body.titulo,
        conteudo: req.body.conteudo
      };

      if (req.file) {
        updates.midia = `/uploads/${req.file.filename}`;
      }

      const atualizado = await Model.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );
      res.json(atualizado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Excluir
  app.delete(`/api/${tipo}/:id`, authenticate, async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Conexão MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});