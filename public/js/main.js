document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Carregar destaques, notícias e eventos simultaneamente
    const [destaquesRes, noticiasRes, eventosRes] = await Promise.all([
      fetch('/api/destaques'),
      fetch('/api/noticias'),
      fetch('/api/eventos')
    ]);

    // Verificar erros nas respostas
    if (!destaquesRes.ok) throw new Error('Erro ao carregar destaques');
    if (!noticiasRes.ok) throw new Error('Erro ao carregar notícias');
    if (!eventosRes.ok) throw new Error('Erro ao carregar eventos');

    // Converter para JSON
    const destaques = await destaquesRes.json();
    const noticias = await noticiasRes.json();
    const eventos = await eventosRes.json();

    // Função para renderizar os destaques com layout especial
    function renderizarDestaques(destaques) {
      const container = document.getElementById('destaques-content');
      
      if (!destaques.length) {
        container.innerHTML = '<p class="sem-conteudo">Nenhum destaque encontrado</p>';
        return;
      }

      // Ordenar por data (mais recente primeiro) e limitar a 3
      const destaquesRecentes = destaques
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 3);

      let html = '';

      if (destaquesRecentes.length === 1) {
        html = criarDestaqueHTML(destaquesRecentes[0], 'principal');
      } 
      else if (destaquesRecentes.length === 2) {
        html = `
          ${criarDestaqueHTML(destaquesRecentes[0], 'principal')}
          <div class="destaques-secundarios">
            ${criarDestaqueHTML(destaquesRecentes[1], 'secundario')}
          </div>
        `;
      } 
      else {
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

      const linkAtributo = destaque.link ? `href="${destaque.link}" target="_blank"` : 'href="#"';

      return `
        <a ${linkAtributo} class="${containerClass}">
          ${mediaHTML}
          <div class="destaque-conteudo">
            <h3>${destaque.titulo}</h3>
            <p>${destaque.conteudo.substring(0, 100)}${destaque.conteudo.length > 100 ? '...' : ''}</p>
          </div>
        </a>
      `;
    }

    // Função de renderização reutilizável para notícias e eventos
    const renderizarSecao = (dados, containerId, tipo) => {
  const container = document.getElementById(containerId);
  
  if (!dados.length) {
    container.innerHTML = `<p class="sem-conteudo">Nenhum ${tipo} encontrado</p>`;
    return;
  }

  container.innerHTML = dados.map(item => `
    <div class="noticia-card">
      <div class="noticia-imagem">
        ${item.midia ? `
          ${item.midia.includes('.mp4') ? `
            <video controls>
              <source src="${item.midia}" type="video/mp4">
            </video>
          ` : `
            <img src="${item.midia}" alt="${item.titulo}">
          `}
        ` : '<div style="background:#333; width:100%; height:100%;"></div>'}
      </div>
      <div class="noticia-conteudo">
        <h3>${item.titulo ?? 'Sem título'}</h3>
        <p>${item.conteudo ?? 'Conteúdo não disponível'}</p>
        <small>
          ${tipo === 'notícia' ? 'Publicado' : 'Data do evento'}: 
          ${new Date(item.data).toLocaleDateString('pt-BR')}
        </small>
      </div>
    </div>
  `).join('');
};

    // Renderizar todas as seções
    renderizarDestaques(destaques);
    renderizarSecao(noticias, 'noticias-content', 'notícia');
    renderizarSecao(eventos, 'eventos-content', 'eventos');

  } catch (error) {
    console.error('Erro ao carregar conteúdo:', error);
    
    // Exibir mensagens de erro para o usuário
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