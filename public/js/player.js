let isPlaying = false;

const radioStream = new Howl({
  src: ['https://centova01.logicahost.com.br:20003/stream'],
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
    alert('Erro ao conectar à rádio!');
    updateStatus(false, true);
  },
  onplayerror: (id, error) => {
    console.error('Erro ao reproduzir:', error);
    alert('Erro ao iniciar a reprodução!');
    updateStatus(false, true);
  }
});

function togglePlay() {
  if (!radioStream) return;

  if (isPlaying) {
    radioStream.pause();
  } else {
    radioStream.play().catch((error) => {
      console.error("Erro ao reproduzir:", error);
      alert("Erro ao iniciar reprodução!");
      updateStatus(false, true);
    });
  }
}

function updatePlayButton() {
  const btn = document.getElementById('playPauseBtn');
  btn.textContent = isPlaying ? '⏸ Pause' : '▶️ Play';
}

function updateStatus(isOnline, hasError = false) {
  const status = document.getElementById('status');
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

document.getElementById('playPauseBtn').addEventListener('click', togglePlay);

// Volume control
const volumeSlider = document.getElementById('volume');
volumeSlider.addEventListener('input', (e) => {
  const vol = parseFloat(e.target.value);
  radioStream.volume(vol);
});
