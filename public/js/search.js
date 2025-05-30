// Função de busca melhorada
function performSearch() {
  const searchTerm = document.getElementById('site-search').value.toLowerCase().trim();
  if (!searchTerm) {
    clearHighlights();
    return;
  }
  
  // Busca em todas as seções de conteúdo
  const sections = ['noticias', 'eventos', 'quem-somos', 'contato'];
  let resultsFound = false;
  
  // Primeiro limpe os destaques anteriores
  clearHighlights();
  
  sections.forEach(section => {
    const sectionElement = document.getElementById(section);
    if (!sectionElement) return;
    
    const elements = sectionElement.querySelectorAll('*:not(script):not(style)');
    let sectionMatch = false;
    
    elements.forEach(el => {
      if (el.childNodes.length > 0 && el.textContent.toLowerCase().includes(searchTerm)) {
        // Salvar o fundo original
        if (!el.dataset.originalBg) {
          el.dataset.originalBg = el.style.backgroundColor || '';
        }
        
        // Destacar
        el.style.backgroundColor = '#ffffcc';
        el.style.color = '#000';
        sectionMatch = true;
        resultsFound = true;
        
        // Rolar para o elemento se for o primeiro resultado
        if (!document.querySelector('.search-highlighted')) {
          el.classList.add('search-highlighted');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
    
    // Destacar cabeçalho da seção
    const header = sectionElement.querySelector('h2');
    if (header && sectionMatch) {
      if (!header.dataset.originalBg) {
        header.dataset.originalBg = header.style.backgroundColor || '';
      }
      header.style.backgroundColor = '#ff6600';
    }
  });
  
  // Feedback visual
  const searchBtn = document.getElementById('search-btn');
  if (resultsFound) {
    searchBtn.textContent = '✓';
    searchBtn.style.background = '#4CAF50';
  } else {
    searchBtn.textContent = '✕';
    searchBtn.style.background = '#f44336';
    alert('Nenhum resultado encontrado para: ' + searchTerm);
  }
  
  setTimeout(() => {
    searchBtn.textContent = '🔍';
    searchBtn.style.background = '#ff6600';
  }, 2000);
}

// Limpar destaques
function clearHighlights() {
  document.querySelectorAll('[data-original-bg]').forEach(el => {
    el.style.backgroundColor = el.dataset.originalBg;
    el.style.color = '';
  });
  
  document.querySelectorAll('.search-highlighted').forEach(el => {
    el.classList.remove('search-highlighted');
  });
}

// Event Listeners melhorados
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('site-search');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    
    // Limpar busca quando o campo estiver vazio
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.trim() === '') {
        clearHighlights();
      }
    });
  } else {
    console.error('Elementos de busca não encontrados!');
  }
});