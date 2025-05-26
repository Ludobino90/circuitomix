// Configuração do Howler.js para compatibilidade universal
let radioStream = null;
let isPlaying = false;

// Inicializar o player
function initPlayer() {
  radioStream = new Howl({
    src: ['https://stream.zeno.fm/2zefp4qy0zzuv'],
    html5: true,
    format: ['mp3'],
    autoplay: false,
    preload: 'metadata',
    onplay: () => {
      isPlaying = true;
      updatePlayButton();
    },
    onpause: () => {
      isPlaying = false;
      updatePlayButton();
    },
    onend: () => {
      isPlaying = false;
      updatePlayButton();
    },
    onloaderror: (id, error) => {
      console.error('Erro no player:', error);
      alert('Erro ao conectar à rádio!');
    }
  });

  // Configurar controles
  const volumeControl = document.getElementById('volume');
  volumeControl.addEventListener('input', (e) => {
    radioStream.volume(e.target.value);
  });

  // Volume inicial
  radioStream.volume(volumeControl.value);
}

// Atualizar botão play/pause
function updatePlayButton() {
  const btn = document.getElementById('playPauseBtn');
  btn.textContent = isPlaying ? 'Pause' : 'Play';
}

// Controle principal
function togglePlay() {
  if (!radioStream) return;

  if (isPlaying) {
    radioStream.pause();
  } else {
    // Lidar com políticas de autoplay
    radioStream.play().catch(error => {
      console.log('Autoplay bloqueado - requer interação do usuário');
    });
  }
}

// Controle de volume
function setVolume(level) {
  if (radioStream) {
    radioStream.volume(level);
  }
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', initPlayer);

// Habilitar autoplay após primeira interação
document.addEventListener('click', () => {
  if (!radioStream) return;
  
  // Tenta iniciar automaticamente após primeira interação
  if (!isPlaying) {
    radioStream.play().catch(error => {
      console.log('Requer interação explícita do usuário');
    });
  }
});