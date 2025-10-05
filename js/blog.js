(function(){
  const LIST_SELECTOR = '#blog-list .blog-grid';
  const TAGS_SELECTOR = '#blog-tags';
  const SEARCH_SELECTOR = '#blog-search';
  const DATA_URLS = ['assets/data/posts.json','./assets/data/posts.json','/assets/data/posts.json'];
  const CONFIG_URL = 'assets/config/blog.json';
  const FALLBACK = { items: [
    { id:'2024-10-senshuken', title:'選手権', date:'2024-10-01', location:'武蔵境', category:'大会', coverImageUrl:'assets/images/38559702-759D-49DD-9888-5565350877A9.jpg', excerpt:'ベスト16進出。濃密なトーナメントを経て積み上げた経験の断片。', tags:['選手権','大会','成長'] },
    { id:'2024-08-ensei', title:'遠征', date:'2024-08-10', location:'波崎', category:'合宿', coverImageUrl:'assets/images/S__23273486.jpg', excerpt:'熱と潮の匂いに満ちた数日間の記録。', tags:['遠征','合宿','夏'] },
    { id:'2023-03-kohaku', title:'部内紅白戦', date:'2023-03-20', location:'稲城ヴェルディフィールド', category:'部活動', coverImageUrl:'assets/images/55831B31-0733-43AD-BE72-B0952DF21654.jpg', excerpt:'競い合い、笑い合い、チームがチームになる瞬間。', tags:['紅白戦','チーム'] },
    { id:'2024-09-exchange', title:'交流試合', date:'2024-09-05', location:'天王洲', category:'交流戦', coverImageUrl:'assets/images/blog-images/C5C2533F-68D4-40A9-85C8-6E6C351CC3BA.jpg', excerpt:'夜風と街の灯りが交差するピッチで見た景色。', tags:['交流戦','社会人','ナイトゲーム'] }
  ]};

  async function loadConfig(){
    try{ const r=await fetch(CONFIG_URL, {cache:'no-store'}); if(!r.ok) throw 0; return await r.json(); }catch(_){ return { api:{ enabled:false } }; }
  }

  function createCard(item){
    const art = document.createElement('article');
    art.className = 'blog-card';
    art.setAttribute('data-scroll-animation','');
    art.setAttribute('data-scroll-direction','up');
    const href = `post.html?id=${encodeURIComponent(item.id)}`;
    art.innerHTML = `
      <a class="blog-thumb" href="${href}" aria-label="${item.title}の詳細">
        <img src="${item.coverImageUrl}" alt="${item.title}" loading="lazy">
      </a>
      <div class="blog-meta">${item.date}${item.location ? ' ・ ' + item.location : ''}</div>
      <h3 class="blog-heading"><a href="${href}">${item.title}</a></h3>
      <p class="blog-excerpt">${item.excerpt || ''}</p>
    `;
    return art;
  }

  async function fetchFirstAvailable(urls){
    for (const u of urls){
      try{
        const res = await fetch(u);
        if (res.ok){ return await res.json(); }
      }catch(_e){ /* try next */ }
    }
    return FALLBACK;
  }

  async function fetchFromApiList(cfg){
    if (!cfg || !cfg.api || !cfg.api.enabled) throw new Error('api disabled');
    const url = cfg.api.list || (cfg.api.base ? (cfg.api.base + '?action=list') : null);
    if (!url) throw new Error('no list url');
    const res = await fetch(url, {cache:'no-store'});
    if (!res.ok) throw new Error('api list fetch failed');
    const json = await res.json();
    if (Array.isArray(json)) return { items: json };
    if (json && Array.isArray(json.items)) return json;
    return { items: [] };
  }

  function readDraft(){
    try{
      const j = localStorage.getItem('bkts-posts-drafts');
      if(!j) return [];
      const arr = JSON.parse(j);
      return Array.isArray(arr) ? arr : [];
    }catch(_){ return []; }
  }
  function readStore(){
    try{
      const j = localStorage.getItem('bkts-posts-store');
      if(!j) return [];
      const arr = JSON.parse(j);
      return Array.isArray(arr) ? arr : [];
    }catch(_){ return []; }
  }

  function buildTags(items){
    const set = new Set();
    items.forEach(it => (it.tags||[]).forEach(t => set.add(t)));
    const box = document.querySelector(TAGS_SELECTOR);
    if (!box) return;
    box.innerHTML='';
    [...set].sort().forEach(t => {
      const a=document.createElement('a');
      a.textContent = '#'+t;
      a.href='#';
      a.style.cssText='color:#e7ecff;text-decoration:none;border:1px solid rgba(255,255,255,.12);padding:6px 10px;border-radius:999px;';
      a.addEventListener('click',(e)=>{ e.preventDefault(); filter({tag:t}); });
      box.appendChild(a);
    });
  }

  let ALL_ITEMS = [];
  function dedupeById(items){
    const map = new Map();
    for (const it of items){ if (it && it.id){ map.set(it.id, it); } }
    return [...map.values()];
  }
  function render(items){
    const grid = document.querySelector(LIST_SELECTOR);
    if (!grid) return;
    grid.innerHTML = '';
    if (!items.length){
      const d=document.createElement('div'); d.style.cssText='color:#cbd5e1;padding:10px 16px'; d.textContent='該当する記事がありません'; grid.appendChild(d); return;
    }
    for (const it of items){ grid.appendChild(createCard(it)); }
    if (window.handleScrollAnimation) window.handleScrollAnimation();
  }

  function filter({text, tag}={}){
    const t=(text||'').toLowerCase();
    let items = ALL_ITEMS.slice();
    if (tag){ items = items.filter(it => (it.tags||[]).includes(tag)); }
    if (t){ items = items.filter(it =>
      (it.title||'').toLowerCase().includes(t) ||
      (it.excerpt||'').toLowerCase().includes(t) ||
      (it.tags||[]).join(',').toLowerCase().includes(t)
    ); }
    items.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    render(items);
  }

  async function load(){
    const cfg = await loadConfig();
    let apiItems = [];
    if (cfg.api && cfg.api.enabled){
      try{ const j = await fetchFromApiList(cfg); apiItems = (j.items||[]); }catch(_){ apiItems = []; }
    }
    let json = await fetchFirstAvailable(DATA_URLS);
    let fileItems = (json.items || []).slice();
    const store = readStore();
    const drafts = readDraft();
    ALL_ITEMS = dedupeById([ ...store, ...drafts, ...apiItems, ...fileItems ]);
    buildTags(ALL_ITEMS);
    filter({});

    const si=document.querySelector(SEARCH_SELECTOR);
    if(si){ si.addEventListener('input', ()=> filter({ text: si.value })); }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
