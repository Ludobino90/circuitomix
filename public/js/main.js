document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Carregar ambos simultaneamente com Promise.all
    const [noticiasRes, eventosRes] = await Promise.all([
      fetch('/api/noticias'),
      fetch('/api/eventos')
    ]);

    // Verificar erros nas respostas
    if (!noticiasRes.ok) throw new Error('Erro ao carregar notícias');
    if (!eventosRes.ok) throw new Error('Erro ao carregar eventos');

    // Converter para JSON
    const noticias = await noticiasRes.json();
    const eventos = await eventosRes.json();

    // Função de renderização reutilizável
    const renderizarSecao = (dados, containerId, tipo) => {
      const container = document.getElementById(containerId);
      
      if (!dados.length) {
        container.innerHTML = `<p class="sem-conteudo">Nenhum ${tipo} encontrado</p>`;
        return;
      }

      container.innerHTML = dados.map(item => `
        <article class="card">
          <h3>${item.titulo ?? 'Sem título'}</h3>
          ${item.midia ? `
            <div class="midia-container">
              ${item.midia.includes('.mp4') ? `
                <video controls class="midia">
                  <source src="${item.midia}" type="video/mp4">
                </video>
              ` : `
                <img src="${item.midia}" alt="${item.titulo}" class="midia">
              `}
            </div>
          ` : ''}
          <p>${item.conteudo ?? 'Conteúdo não disponível'}</p>
          <small>
            ${tipo === 'notícia' ? 'Publicado' : 'Data do evento'}: 
            ${new Date(item.data).toLocaleDateString('pt-BR')}
          </small>
        </article>
      `).join('');
    };

    // Renderizar ambas as seções
    renderizarSecao(noticias, 'noticias-content', 'notícia');
    renderizarSecao(eventos, 'eventos-content', 'eventos');

  } catch (error) {
    console.error('Erro ao carregar conteúdo:', error);
    
    // Exibir mensagens de erro para o usuário
    const tratarErro = (containerId, mensagem) => {
      const container = document.getElementById(containerId);
      container.innerHTML = `<p class="erro">${mensagem}</p>`;
    };

    tratarErro('noticias-content', 'Falha ao carregar notícias');
    tratarErro('eventos-content', 'Falha ao carregar eventos');
  }
});