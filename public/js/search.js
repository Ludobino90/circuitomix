function highlightSearchTerm(element, searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const nodes = element.childNodes;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    if (node.nodeType === 3) { // Text node
      const text = node.textContent;
      const newText = text.replace(regex, '<span class="search-highlight">$1</span>');
      
      if (newText !== text) {
        const newElement = document.createElement('span');
        newElement.innerHTML = newText;
        node.parentNode.replaceChild(newElement, node);
      }
    } else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') { // Element node
      highlightSearchTerm(node, searchTerm);
    }
  }
}

function clearHighlights() {
  document.querySelectorAll('.search-highlight').forEach(highlight => {
    const parent = highlight.parentNode;
    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    parent.normalize();
  });
}

function performSearch() {
  const searchTerm = document.getElementById('site-search').value.trim();
  if (!searchTerm) {
    clearHighlights();
    return;
  }

  clearHighlights();
  
  // Escapar caracteres especiais para regex
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const sections = ['noticias', 'eventos', 'quem-somos', 'contato'];
  let resultsFound = false;

  sections.forEach(section => {
    const sectionElement = document.getElementById(section);
    if (!sectionElement) return;
    
    highlightSearchTerm(sectionElement, escapedTerm);
    
    if (sectionElement.querySelector('.search-highlight')) {
      resultsFound = true;
      sectionElement.classList.add('has-results');
    }
  });

  // Feedback visual
  const searchBtn = document.getElementById('search-btn');
  const firstHighlight = document.querySelector('.search-highlight');
  
  if (firstHighlight) {
    firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchBtn.textContent = '✓';
    searchBtn.style.background = '#4CAF50';
  } else {
    searchBtn.textContent = '✕';
    searchBtn.style.background = '#f44336';
  }

  setTimeout(() => {
    searchBtn.textContent = '🔍';
    searchBtn.style.background = '#ff6600';
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('site-search');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.trim() === '') clearHighlights();
    });
  }
});