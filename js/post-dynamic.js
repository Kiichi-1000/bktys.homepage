(function(){
  const DATA_URLS = ['assets/data/posts.json','./assets/data/posts.json','/assets/data/posts.json'];
  const CONFIG_URL = 'assets/config/blog.json';
  const FALLBACK = { items: [
    { id:'2024-10-senshuken', title:'選手権', date:'2024-10-01', location:'武蔵境', category:'大会', coverImageUrl:'assets/images/38559702-759D-49DD-9888-5565350877A9.jpg', author:'BKTS 編集部', tags:['選手権','大会','成長'], body:'<p>試合前、ピッチに立ったときの空気はいつもよりも硬く、しかし確かな熱を含んでいた。</p><p>ベスト16という結果は、数字の上では通過点かもしれない。ただ、その過程はチームを前に進めた。</p>' },
    { id:'2024-08-ensei', title:'遠征', date:'2024-08-10', location:'波崎', category:'合宿', coverImageUrl:'assets/images/S__23273486.jpg', author:'BKTS 編集部', tags:['遠征','合宿','夏'], body:'<p>潮の匂いが混じる風が、朝のピッチを抜けていく。</p><p>小さな勝ちと小さな負けを積み重ね、旅の余白のような柔らかい表情が残った。</p>' },
    { id:'2023-03-kohaku', title:'部内紅白戦', date:'2023-03-20', location:'稲城ヴェルディフィールド', category:'部活動', coverImageUrl:'assets/images/55831B31-0733-43AD-BE72-B0952DF21654.jpg', author:'BKTS 編集部', tags:['紅白戦','チーム'], body:'<p>紅と白に分かれたベストが、春の光を受けて柔らかく揺れる。</p><p>笛の音が止むと、笑い声がひとつ増えた。</p>' },
    { id:'2024-09-exchange', title:'交流試合', date:'2024-09-05', location:'天王洲', category:'交流戦', coverImageUrl:'assets/images/C5C2533F-68D4-40A9-85C8-6E6C351CC3BA.jpg', author:'BKTS 編集部', tags:['交流戦','社会人','ナイトゲーム'], body:'<p>水面を渡る風と、湾岸の灯り。</p><p>試合後の握手にこもった温度は、結果以上に確かなものとして残った。</p>' }
  ]};
  function qs(k){ return new URL(location.href).searchParams.get(k); }
  async function fetchFirst(urls){
    for (const u of urls){ try{ const r=await fetch(u); if(r.ok) return r.json(); }catch(_){}}
    return FALLBACK;
  }
  async function loadConfig(){ try{ const r=await fetch(CONFIG_URL, {cache:'no-store'}); if(!r.ok) throw 0; return await r.json(); }catch(_){ return { api:{ enabled:false } }; }
}
async function fetchFromApiDetail(cfg, id){
  if (!cfg || !cfg.api || !cfg.api.enabled) throw new Error('api disabled');
  const urlTpl = cfg.api.detail || (cfg.api.base ? (cfg.api.base + '?action=detail&id={id}') : null);
  if (!urlTpl) throw new Error('no detail url');
  const url = urlTpl.replace('{id}', encodeURIComponent(id));
  const r = await fetch(url, {cache:'no-store'});
  if (!r.ok) throw new Error('detail fetch failed');
  const json = await r.json();
  if (json && json.item) return json.item;
  return json; // allow direct item
}
async function fetchFromApiList(cfg){
  if (!cfg || !cfg.api || !cfg.api.enabled) throw new Error('api disabled');
  const url = cfg.api.list || (cfg.api.base ? (cfg.api.base + '?action=list') : null);
  if (!url) throw new Error('no list url');
  const r = await fetch(url, {cache:'no-store'});
  if (!r.ok) throw new Error('list fetch failed');
  const j = await r.json();
  if (Array.isArray(j)) return { items: j };
  if (j && Array.isArray(j.items)) return j;
  return { items: [] };
}
  function readDraft(){ try{ const j=localStorage.getItem('bkts-posts-drafts'); return j?JSON.parse(j):[]; }catch(_){ return []; } }
  function readStore(){ try{ const j=localStorage.getItem('bkts-posts-store'); return j?JSON.parse(j):[]; }catch(_){ return []; } }
  function esc(s){ return (s||'').replace(/[&<>\"]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m])); }
  function set(id, html){ const el=document.getElementById(id); if(el) el.innerHTML=html; }
  function setCover(src, alt){ const el=document.getElementById('post-cover'); if(!el) return; el.innerHTML = src ? `<img src="${src}" alt="${esc(alt||'cover')}">` : ''; }
  function renderTags(tags){ const c=document.getElementById('post-tags'); if(!c) return; c.innerHTML=''; (tags||[]).forEach(t=>{ const s=document.createElement('span'); s.className='post-tag'; s.textContent='#'+t; c.appendChild(s); }); }

  async function load(){
    const id = qs('id');
    const cfg = await loadConfig();
    // 1) local store / drafts 優先
    let item = readStore().find(x=> x.id===id) || readDraft().find(x=> x.id===id);
    // 2) API
    if (!item && cfg.api && cfg.api.enabled){
      try{ if (id) item = await fetchFromApiDetail(cfg, id); }catch(_){}
      if (!item){ try{ const data = await fetchFromApiList(cfg); item = (data.items||[]).find(x=> x.id===id); }catch(_){} }
    }
    // 3) JSON
    if (!item){ const data = await fetchFirst(DATA_URLS); item = (data.items||[]).find(x=> x.id===id) || (data.items||[])[0]; }
    if(!item){ set('post-title','Not found'); set('post-crumb','Not found'); return; }
    set('post-crumb', esc(item.title));
    set('post-title', esc(item.title));
    set('post-meta', `${esc(item.date||'')}${item.location? ' ・ '+esc(item.location):''}${item.category? ' ・ '+esc(item.category):''}`);
    setCover(item.coverImageUrl, item.title);
    set('post-author', esc(item.author||'BKTS 編集部'));
    set('post-body', item.body || '');
    renderTags(item.tags);
  }
  document.addEventListener('DOMContentLoaded', load);
})();
