document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [destaquesRes, noticiasRes, eventosRes] = await Promise.all([
      fetch('/api/destaques'),
      fetch('/api/noticias'),
      fetch('/api/eventos')
    ]);

    if (!destaquesRes.ok) throw new Error('Erro ao carregar destaques');
    if (!noticiasRes.ok) throw new Error('Erro ao carregar notícias');
    if (!eventosRes.ok) throw new Error('Erro ao carregar eventos');

    const destaques = await destaquesRes.json();
    const noticias = await noticiasRes.json();
    const eventos = await eventosRes.json();

    function renderizarDestaques(destaques) {
      const container = document.getElementById('destaques-content');
      if (!destaques.length) {
        container.innerHTML = '<p class="sem-conteudo">Nenhum destaque encontrado</p>';
        return;
      }

      const destaquesRecentes = destaques
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 3);

      let html = '';

      if (destaquesRecentes.length === 1) {
        html = criarDestaqueHTML(destaquesRecentes[0], 'principal');
      } else if (destaquesRecentes.length === 2) {
        html = `
          ${criarDestaqueHTML(destaquesRecentes[0], 'principal')}
          <div class="destaques-secundarios">
            ${criarDestaqueHTML(destaquesRecentes[1], 'secundario')}
          </div>
        `;
      } else {
        html = `
          ${criarDestaqueHTML(destaquesRecentes[0], 'principal')}
          <div class="destaques-secundarios">
            ${criarDestaqueHTML(destaquesRecentes[1], 'secundario')}
            ${criarDestaqueHTML(destaquesRecentes[2], 'secundario')}
          </div>
        `;
      }

      container.innerHTML = html;
    }

    function criarDestaqueHTML(destaque, tipo) {
      const containerClass = tipo === 'principal' 
        ? 'destaque-principal' 
        : 'destaque-secundario';

      const mediaHTML = destaque.midia
        ? destaque.midia.endsWith('.mp4')
          ? `<video src="${destaque.midia}" class="destaque-imagem" autoplay muted loop></video>`
          : `<img src="${destaque.midia}" alt="${destaque.titulo}" class="destaque-imagem">`
        : '<div class="destaque-imagem" style="background:#333;"></div>';

      return `
        <div class="${containerClass} abrir-detalhes" data-id="${destaque._id}" data-tipo="destaques">
          ${mediaHTML}
          <div class="destaque-conteudo">
            <h3>${destaque.titulo}</h3>
            <p>${destaque.conteudo.substring(0, 100)}${destaque.conteudo.length > 100 ? '...' : ''}</p>
          </div>
        </div>
      `;
    }

    const renderizarSecao = (dados, containerId, tipo) => {
      const container = document.getElementById(containerId);
      const wrapper = container.closest('.conteudo-paginado-wrapper');
      const porPagina = 6;
      let paginaAtual = 0;
      let slides = [];

      if (!dados.length) {
        container.innerHTML = `<p class="sem-conteudo">Nenhum ${tipo} encontrado</p>`;
        return;
      }

      for (let i = 0; i < dados.length; i += porPagina) {
        slides.push(dados.slice(i, i + porPagina));
      }

      const renderizarSlide = (slideIndex) => {
        const slideDados = slides[slideIndex] || [];
        let html = '';

        slideDados.forEach(item => {
          const mediaHTML = item.midia
            ? item.midia.includes('.mp4')
              ? `<video controls><source src="${item.midia}" type="video/mp4"></video>`
              : `<img src="${item.midia}" alt="${item.titulo}">`
            : '<div style="background:#333; width:100%; height:100%;"></div>';

          html += `
            <div class="noticia-card abrir-detalhes" data-id="${item._id}" data-tipo="${tipo}">
              <div class="noticia-imagem">${mediaHTML}</div>
              <div class="noticia-conteudo">
                <h3>${item.titulo ?? 'Sem título'}</h3>
                <p>${item.conteudo ?? 'Conteúdo não disponível'}</p>
                <small>
                  ${tipo === 'noticias' ? 'Publicado' : 'Data do evento'}: 
                  ${new Date(item.data).toLocaleDateString('pt-BR')}
                </small>
              </div>
            </div>
          `;
        });

        container.innerHTML = html;
      };

      container.classList.add('grid-paginado');

      const atualizarSlide = () => renderizarSlide(paginaAtual);

      const setaEsquerda = wrapper.querySelector('.seta-esquerda');
      const setaDireita = wrapper.querySelector('.seta-direita');
      const totalPaginas = slides.length;

      setaEsquerda?.addEventListener('click', () => {
        if (paginaAtual > 0) {
          paginaAtual--;
          atualizarSlide();
        }
      });

      setaDireita?.addEventListener('click', () => {
        if (paginaAtual < totalPaginas - 1) {
          paginaAtual++;
          atualizarSlide();
        }
      });

      atualizarSlide();
    };

    renderizarDestaques(destaques);
    renderizarSecao(noticias, 'noticias-content', 'noticias');
    renderizarSecao(eventos, 'eventos-content', 'eventos');

    // 🎧 PLAYER DE RÁDIO
    const player = document.getElementById('player');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const faixaAtual = document.getElementById('faixaAtual');

    if (player && playPauseBtn && faixaAtual) {
      playPauseBtn.addEventListener('click', () => {
        if (player.paused) {
          player.play();
          playPauseBtn.textContent = '⏸️';
        } else {
          player.pause();
          playPauseBtn.textContent = '▶️';
        }
      });

      const atualizarFaixa = async () => {
        try {
          const response = await fetch('/api/stream-info');
          const data = await response.json();
          faixaAtual.textContent = data.title || 'Sem informação';
        } catch (err) {
          faixaAtual.textContent = 'Erro ao carregar faixa';
        }
      };

      atualizarFaixa();
      setInterval(atualizarFaixa, 15000);
    }

    // 🪟 MODAL DE DETALHES
    function abrirModal(dados) {
      const modal = document.getElementById('modal-detalhes');
      const modalInfo = document.getElementById('modal-info');

      const mediaHTML = dados.midia
        ? dados.midia.includes('.mp4')
          ? `<video src="${dados.midia}" autoplay muted loop style="width:100%;max-height:400px;margin-bottom:1rem;"></video>`
          : `<img src="${dados.midia}" alt="${dados.titulo}" style="width:100%;max-height:400px;object-fit:cover;margin-bottom:1rem;">`
        : '';

      modalInfo.innerHTML = `
        ${mediaHTML}
        <h2>${dados.titulo}</h2>
        <p>${dados.conteudo}</p>
        <p style="margin-top:1rem;font-size:0.9em;">
          ${dados.__tipo === 'evento' ? 'Data do evento' : 'Publicado em'}: 
          ${new Date(dados.data).toLocaleDateString('pt-BR')}
        </p>
      `;

      modal.classList.remove('oculto');
    }

    document.getElementById('fechar-modal').addEventListener('click', () => {
      document.getElementById('modal-detalhes').classList.add('oculto');
    });

    document.body.addEventListener('click', async (e) => {
      const el = e.target.closest('.abrir-detalhes');
      if (el) {
        const id = el.dataset.id;
        const tipo = el.dataset.tipo;

        try {
          const res = await fetch(`/api/${tipo}/${id}`);
          if (!res.ok) throw new Error('Erro ao buscar detalhes');
          const dados = await res.json();
          dados.__tipo = tipo.slice(0, -1); // "noticias" → "noticia", "eventos" → "evento"
          abrirModal(dados);
        } catch (err) {
          alert('Erro ao carregar detalhes');
        }
      }
    });

  } catch (error) {
    console.error('Erro ao carregar conteúdo:', error);
    const tratarErro = (containerId, mensagem) => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<p class="erro">${mensagem}</p>`;
      }
    };
    tratarErro('destaques-content', 'Falha ao carregar destaques');
    tratarErro('noticias-content', 'Falha ao carregar notícias');
    tratarErro('eventos-content', 'Falha ao carregar eventos');
  }
});
