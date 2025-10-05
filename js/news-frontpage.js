// Build newspaper frontpage from existing .news-list (latest 3)
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.news-list');
  const grid = document.getElementById('broadcast-grid');
  const tickerTrack = document.getElementById('broadcast-ticker-track');
  if (!list || !grid) return;

  const items = Array.from(list.querySelectorAll('.news-item')).slice(0,3);
  if (items.length === 0) return;

  // Lead = first, Side = rest
  const [first, ...rest] = items;

  function extract(el){
    return {
      date: el.querySelector('.news-date')?.textContent?.trim() || '',
      category: el.querySelector('.news-category')?.textContent?.trim() || '',
      title: el.querySelector('.news-title')?.textContent?.trim() || '',
      excerpt: el.querySelector('.news-excerpt')?.textContent?.trim() || ''
    };
  }

  const lead = extract(first);
  const leadCard = document.createElement('article');
  leadCard.className = 'broadcast-lead broadcast-card';
  leadCard.innerHTML = `
    <span class="broadcast-kicker">トップ</span>
    <div class="broadcast-meta">${lead.date} ・ ${lead.category}</div>
    <h3 class="broadcast-title">${lead.title}</h3>
    <p class="broadcast-excerpt">${lead.excerpt}</p>
  `;
  leadCard.addEventListener('click', () => openModal(lead));

  const sideWrap = document.createElement('div');
  sideWrap.className = 'broadcast-side';
  rest.forEach((r, idx) => {
    const data = extract(r);
    const card = document.createElement('article');
    card.className = 'broadcast-card';
    card.innerHTML = `
      <span class=\"broadcast-kicker\">${data.category}</span>
      <div class="broadcast-meta">${data.date}</div>
      <h4 class="broadcast-title">${data.title}</h4>
      <p class="broadcast-excerpt">${data.excerpt}</p>
    `;
    card.addEventListener('click', () => openModal(data));
    sideWrap.appendChild(card);
  });

  grid.appendChild(leadCard);
  grid.appendChild(sideWrap);

  // Ticker content
  if (tickerTrack){
    const line = items.map(el => {
      const t = el.querySelector('.news-title')?.textContent?.trim() || '';
      const d = el.querySelector('.news-date')?.textContent?.trim() || '';
      return `[${d}] ${t}`;
    }).join('  ｜  ');
    tickerTrack.textContent = line + '  ｜  ' + line; // loop effect
  }

  // Modal handlers
  const modal = document.getElementById('paper-modal');
  const modalContent = document.getElementById('paper-modal-content');
  function openModal(data){
    modalContent.innerHTML = `
      <header>
        <div class="paper-article-meta">${data.date} ・ ${data.category}</div>
        <h2 class="paper-article-title">${data.title}</h2>
      </header>
      <div class="paper-article-body">${data.excerpt}</div>
    `;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeModal();
  });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });
});


