(function(){
  let DATA = [];

  // notes.jsonからデータを読み込む
  async function loadNotes() {
    try {
      const response = await fetch('assets/data/notes.json');
      const json = await response.json();
      DATA = (json.items || []).map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        date: item.date,
        cover: item.coverImageUrl || 'assets/images/S__23273487.jpg'
      }));
      mountGrid();
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  function createCard(item){
    const div = document.createElement('div');
    div.className = 'note-card';
    div.setAttribute('data-id', item.id);
    div.innerHTML = `
      <a class="note-card__thumb" href="note-post.html?id=${encodeURIComponent(item.id)}"><img src="${item.cover}" alt="${item.title}"></a>
      <div class="note-card__body">
        <div class="note-card__meta">
          <img src="assets/images/Note.image/icon/BKTYS.writers.icon.jpg" alt="author" width="20" height="20" style="border-radius:50%"> ${item.author} ・ ${item.date}
        </div>
        <h3 class="note-card__title">${item.title}</h3>
      </div>
    `;
    return div;
  }

  function mountGrid(){
    const grid = document.getElementById('note-grid');
    if (!grid) return;
    grid.innerHTML = '';
    DATA.forEach(it => grid.appendChild(createCard(it)));
  }

  function bindInteractions(){
    const grid = document.getElementById('note-grid');
    const list = document.getElementById('note-list');
    const article = document.getElementById('note-article');
    if (grid){
      grid.addEventListener('click', (e)=>{
        const card = e.target.closest('.note-card');
        if (!card) return;
        // aタグの遷移に任せる
      });
    }
    if (list && article){
      list.addEventListener('click', function(e){
        const li = e.target.closest('.note-list__item');
        if (!li) return;
        const id = li.getAttribute('data-id');
        location.href = 'note-post.html?id=' + encodeURIComponent(id);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    loadNotes();
    bindInteractions();
  });
})();

