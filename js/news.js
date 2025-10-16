// News page - Dynamic loading from news.json
(function(){
  let DATA = [];

  // news.jsonからデータを読み込む
  async function loadNews() {
    try {
      const response = await fetch('assets/data/news.json');
      const json = await response.json();
      DATA = (json.items || []).map(item => ({
        id: item.id,
        title: item.title,
        date: item.date,
        category: item.category,
        excerpt: item.excerpt || '',
        body: item.body || ''
      }));
      
      // フロントページ（トップ3件）を生成
      buildFrontpage();
      
      // ニュース一覧を生成
      buildNewsList();
      
    } catch (error) {
      console.error('Failed to load news:', error);
    }
  }

  // トップ4件のフロントページを生成（2x2グリッド）
  function buildFrontpage() {
    const grid = document.getElementById('broadcast-grid');
    const tickerTrack = document.getElementById('broadcast-ticker-track');
    if (!grid) return;

    const top4 = DATA.slice(0, 4);
    if (top4.length === 0) return;

    grid.innerHTML = '';

    // 4つの記事を2x2で表示
    top4.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'broadcast-card';
      const label = index === 0 ? 'NEW' : getCategoryLabel(item.category);
      card.innerHTML = `
        <span class="broadcast-kicker">${label}</span>
        <div class="broadcast-meta">${item.date}</div>
        <h3 class="broadcast-title">${item.title}</h3>
        <p class="broadcast-excerpt">${item.excerpt}</p>
      `;
      card.addEventListener('click', () => openDetail(item.id));
      grid.appendChild(card);
    });

    // ティッカー
    if (tickerTrack) {
      const line = top4.map(item => `[${item.date}] ${item.title}`).join('  ｜  ');
      tickerTrack.textContent = line + '  ｜  ' + line;
    }
  }

  // ニュース一覧を生成
  function buildNewsList() {
    const newsList = document.querySelector('.news-list');
    if (!newsList) return;

    newsList.innerHTML = '';

    DATA.forEach(item => {
      const article = document.createElement('article');
      article.className = 'news-item';
      article.setAttribute('data-category', getCategoryFilter(item.category));
      article.innerHTML = `
        <div class="news-date">${item.date}</div>
        <div class="news-category">${item.category}</div>
        <h3 class="news-title">${item.title}</h3>
        <p class="news-excerpt">${item.excerpt}</p>
        <a href="news-post.html?id=${encodeURIComponent(item.id)}" class="news-link">詳細を見る</a>
      `;
      newsList.appendChild(article);
    });
  }

  // カテゴリ名をフィルター用の値に変換
  function getCategoryFilter(category) {
    const map = {
      'お知らせ': 'announcement',
      '活動報告': 'activity',
      'イベント': 'event'
    };
    return map[category] || 'announcement';
  }

  // カテゴリ名を短いラベルに変換
  function getCategoryLabel(category) {
    const map = {
      'お知らせ': 'INFO',
      '活動報告': 'ACT',
      'イベント': 'EVT'
    };
    return map[category] || 'NEWS';
  }

  // モーダルで詳細を開く（古い実装をサポート）
  function openDetail(id) {
    window.location.href = `news-post.html?id=${encodeURIComponent(id)}`;
  }

  document.addEventListener('DOMContentLoaded', loadNews);
})();
