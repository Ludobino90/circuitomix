const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dataDir = path.join(__dirname, 'api');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Criar pasta uploads se não existir
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração de upload com multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Utilitários para ler e escrever JSON
function readJSON(file) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2));
}

// ================= ROTAS ================= //

// GET notícias
app.get('/api/noticias', (req, res) => {
  res.json(readJSON('noticias.json'));
});

// POST notícia com mídia
app.post('/api/noticias', upload.single('media'), (req, res) => {
  const { titulo, conteudo } = req.body;
  const mediaPath = req.file ? '/uploads/' + req.file.filename : null;
  const noticias = readJSON('noticias.json');
  noticias.push({ titulo, conteudo, media: mediaPath });
  writeJSON('noticias.json', noticias);
  res.json({ success: true });
});

// GET eventos
app.get('/api/eventos', (req, res) => {
  res.json(readJSON('eventos.json'));
});

// POST evento com mídia
app.post('/api/eventos', upload.single('media'), (req, res) => {
  const { titulo, conteudo } = req.body;
  const mediaPath = req.file ? '/uploads/' + req.file.filename : null;
  const eventos = readJSON('eventos.json');
  eventos.push({ titulo, conteudo, media: mediaPath });
  writeJSON('eventos.json', eventos);
  res.json({ success: true });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


//coneccao com o MongoDB

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:SENHA@CLUSTER.mongodb.net/circuitomix?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err));

// Salvar uma nova noticia

const Noticia = require('./models/Noticia');

app.post('/api/publicar', upload.single('midia'), async (req, res) => {
  try {
    const novaNoticia = new Noticia({
      titulo: req.body.titulo,
      conteudo: req.body.conteudo,
      midia: req.file ? '/uploads/' + req.file.filename : null
    });

    await novaNoticia.save();
    res.status(200).json({ message: 'Publicação salva com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar publicação' });
  }
});


