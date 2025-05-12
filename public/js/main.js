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
