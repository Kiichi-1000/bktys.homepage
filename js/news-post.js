(function(){
  const DATA_URLS = ['assets/data/news.json','./assets/data/news.json','/assets/data/news.json'];

  async function fetchFirstAvailable(urls){
    for (const u of urls){
      try{
        const res = await fetch(u);
        if (res.ok){ return await res.json(); }
      }catch(_e){ /* try next */ }
    }
    return { items: [] };
  }

  async function load(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id){
      showNotFound();
      return;
    }

    const json = await fetchFirstAvailable(DATA_URLS);
    const items = json.items || [];
    const article = items.find(it => it.id === id);

    if (!article){
      showNotFound();
      return;
    }

    // Render article
    document.title = article.title + ' - BKTYS News';
    document.getElementById('post-crumb').textContent = article.title;
    document.getElementById('post-title').textContent = article.title;
    document.getElementById('post-meta').textContent = `${article.date} ・ ${article.category}`;
    document.getElementById('post-author').textContent = article.author || 'BKTYS 編集部';
    document.getElementById('post-body').innerHTML = article.body || '<p>記事の内容がありません。</p>';

    // Tags
    const tagsContainer = document.getElementById('post-tags');
    if (article.tags && article.tags.length > 0){
      tagsContainer.innerHTML = article.tags.map(t => `<span class="post-tag">#${t}</span>`).join('');
    }

    // Progress bar
    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }

  function updateProgress(){
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const bar = document.getElementById('post-progress');
    if (bar) bar.style.width = scrolled + '%';
  }

  function showNotFound(){
    document.getElementById('post-title').textContent = '記事が見つかりません';
    document.getElementById('post-body').innerHTML = '<p>指定された記事は存在しません。<a href="news.html">Newsページに戻る</a></p>';
  }

  document.addEventListener('DOMContentLoaded', load);
})();
