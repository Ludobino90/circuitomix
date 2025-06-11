let isPlaying = false;
let radioStream = null;

function initRadio() {
  // Destruir instância anterior se existir
  if (radioStream) {
    radioStream.unload();
  }

  radioStream = new Howl({
    src: ['https://live9.livemus.com.br:27060/stream'],
    html5: true,
    format: ['mp3'],
    autoplay: false,
    preload: 'metadata',
    volume: 0.8,
    onplay: () => {
      isPlaying = true;
      updatePlayButton();
      updateStatus(true);
    },
    onpause: () => {
      isPlaying = false;
      updatePlayButton();
      updateStatus(false);
    },
    onend: () => {
      isPlaying = false;
      updatePlayButton();
      updateStatus(false);
    },
    onloaderror: (id, error) => {
      console.error('Erro no player:', error);
      updateStatus(false, true);
      
      // Tentar reconectar após 5 segundos
      setTimeout(initRadio, 5000);
    },
    onplayerror: (id, error) => {
      console.error('Erro ao reproduzir:', error);
      updateStatus(false, true);
      
      // Tentar novamente após 3 segundos
      setTimeout(() => {
        if (radioStream) radioStream.play();
      }, 3000);
    }
  });
}

function togglePlay() {
  if (!radioStream) {
    initRadio();
  }

  if (isPlaying) {
    radioStream.pause();
  } else {
    radioStream.play().catch((error) => {
      console.error("Erro ao reproduzir:", error);
      updateStatus(false, true);
    });
  }
}

function updatePlayButton() {
  const btn = document.getElementById('playPauseBtn');
  if (btn) {
    btn.textContent = isPlaying ? '⏸ Pause' : '▶️ Play';
  }
}

function updateStatus(isOnline, hasError = false) {
  const status = document.getElementById('status');
  if (status) {
    if (hasError) {
      status.textContent = '🔴 Erro';
      status.setAttribute('error', '');
      status.removeAttribute('success');
    } else if (isOnline) {
      status.textContent = '🟢 Online';
      status.setAttribute('success', '');
      status.removeAttribute('error');
    } else {
      status.textContent = '🔴 Offline';
      status.setAttribute('error', '');
      status.removeAttribute('success');
    }
  }
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  initRadio();
  
  // Configurar botão de play/pause
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlay);
  }

  // Configurar controle de volume
  const volumeSlider = document.getElementById('volume');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      if (radioStream) {
        radioStream.volume(vol);
      }
    });
  }
});