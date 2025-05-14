document.addEventListener("DOMContentLoaded", () => {
  fetch('api/noticias.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('noticias-content');
      data.forEach(noticia => {
        container.innerHTML += `<article><h3>${noticia.titulo}</h3><p>${noticia.conteudo}</p></article>`;
      });
    });

  fetch('api/eventos.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('eventos-content');
      data.forEach(evento => {
        container.innerHTML += `<article><h3>${evento.titulo}</h3><p>${evento.data}</p></article>`;
      });
    });
});

// main.js

async function carregarNoticias() {
  const res = await fetch('/api/noticias');
  const noticias = await res.json();
  const container = document.getElementById('noticias-container');
  container.innerHTML = noticias.map(n => `
    <div class="noticia">
      <h3>${n.titulo}</h3>
      <p>${n.conteudo}</p>
      ${n.media ? `<div><img src="${n.media}" style="max-width:100%;"></div>` : ''}
    </div>
  `).join('');
}

async function carregarEventos() {
  const res = await fetch('/api/eventos');
  const eventos = await res.json();
  const container = document.getElementById('eventos-container');
  container.innerHTML = eventos.map(e => `
    <div class="evento">
      <h3>${e.titulo}</h3>
      <p>${e.conteudo}</p>
      ${e.media ? `<div><img src="${e.media}" style="max-width:100%;"></div>` : ''}
    </div>
  `).join('');
}

window.onload = () => {
  carregarNoticias();
  carregarEventos();
};

