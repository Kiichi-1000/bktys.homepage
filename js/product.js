// PDP loader and interactions
(function(){
  async function fetchProducts(){
    try{
      const res = await fetch('assets/data/products.json', { cache: 'no-store' });
      const json = await res.json();
      return json.products || [];
    }catch(_e){
      return window.BK_PRODUCTS || [];
    }
  }

  function getSlug(){
    const url = new URL(location.href);
    return url.searchParams.get('slug');
  }

  function bySlug(list, slug){ return list.find(p=>p.slug===slug); }

  function priceHtml(p){
    const base = p.salePrice ? `<s>¥${p.price.toLocaleString()}</s> <strong>¥${p.salePrice.toLocaleString()}</strong>`
                             : `<strong>¥${p.price.toLocaleString()}</strong>`;
    return base;
  }

  function updateFreeShip(subtotal){
    const prog = BKTYSCart.progress(subtotal);
    if (prog.isFree) BKTYSA.push('free_shipping_reached', { subtotal: subtotal });
    return prog;
  }

  function render(product){
    const el = document.getElementById('pdp-root');
    if (!el) return;
    const lowStock = Object.values(product.stock).some(n=>n>0 && n<=5);
    el.innerHTML = `
      <header class="pdp-brand">${product.brand}</header>
      <div class="pdp-wrap">
        <div class="pdp-gallery">
          <img id="pdp-img" src="${product.images[0]?.url||''}" alt="${product.images[0]?.alt||product.name}">
          ${product.images.length>1?`<button class=\"nav prev\" aria-label=\"prev\">‹</button><button class=\"nav next\" aria-label=\"next\">›</button>`:''}
        </div>
        <div class="pdp-info">
          <h1 class="pdp-name">${product.name}</h1>
          <div class="pdp-maker">${product.maker||''}</div>
          <div class="pdp-price">${priceHtml(product)}</div>
          <div class="pdp-delivery">${product.deliveryEstimate||''}</div>
          <div class="pdp-producer">${product.producer||''}</div>
          ${lowStock?'<div class="pdp-lowstock">残りわずか</div>':''}
          <div class="pdp-size">
            ${product.sizes.map(s=>`<label><input type="radio" name="size" value="${s}">${s}</label>`).join('')}
          </div>
          <button id="add-to-cart" class="pdp-add" disabled>カートに入れる</button>
          <section class="pdp-tabs" style="margin-top:10px">
            <div style="display:flex; gap:10px; justify-content:flex-start; max-width:520px; margin:8px 0">
              <button data-tab="desc" class="is-active">商品詳細</button>
              <button data-tab="size">サイズ</button>
            </div>
            <div style="max-width:520px;">
              <div class="tab-panel" id="tab-desc">${product.description || '柔らかなコットンと丁寧な縫製で日常に寄り添う一枚。快適な着心地と洗濯耐性を両立。'}</div>
              <div class="tab-panel" id="tab-size" hidden>${product.sizeGuide || 'S: 着丈65/身幅48, M: 69/52, L: 73/55 (cm) 目安。'}</div>
            </div>
          </section>
        </div>
      </div>
      
      <section class="pdp-reco" id="pdp-reco"></section>
    `;

    // Size selection
    const btn = document.getElementById('add-to-cart');
    document.querySelectorAll('input[name="size"]').forEach(r=>{
      r.addEventListener('change', ()=>{
        const size = document.querySelector('input[name="size"]:checked')?.value;
        btn.disabled = !size;
      });
    });

    btn.addEventListener('click', ()=>{
      const size = document.querySelector('input[name="size"]:checked')?.value;
      if (!size){ alert('サイズを選んでください'); return; }
      const price = product.salePrice || product.price;
      const cart = BKTYSCart.addItem({ sku: product.sku, size, price, image: product.images[0]?.url||'', name: product.name, qty:1 });
      // fly-to-cart animation
      try{ BKTYSCart.flyToCartFrom(document.querySelector('.pdp-gallery img')); }catch(_e){}
      // badge
      BKTYSCart.updateBadge?.();
      const prog = BKTYSCart.progress(cart.subtotal);
      BKTYSA.push('add_to_cart', { sku: product.sku, size, subtotal: cart.subtotal, remain: prog.remain, free_shipping: prog.isFree });
      const msg = prog.isFree ? '送料無料になりました！' : `カートに入りました 🎉 あと¥${prog.remain.toLocaleString()}で送料無料`;
      const t = document.createElement('div');
      t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
      setTimeout(()=>t.remove(), 2200);
    });

    // Gallery controls
    if (product.images.length>1){
      const imgEl = document.getElementById('pdp-img');
      let idx = 0;
      const show = (n)=>{ idx=(n+product.images.length)%product.images.length; imgEl.src = product.images[idx].url; };
      document.querySelector('.pdp-gallery .prev')?.addEventListener('click', ()=>show(idx-1));
      document.querySelector('.pdp-gallery .next')?.addEventListener('click', ()=>show(idx+1));
      let sx=0; imgEl.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; },{passive:true});
      imgEl.addEventListener('touchend',e=>{ const dx=(e.changedTouches[0].clientX - sx); if(Math.abs(dx)>40){ show(idx + (dx<0?1:-1)); } },{passive:true});
    }

    // Tabs
    const tabs = document.querySelectorAll('.pdp-tabs button');
    tabs.forEach(b=>b.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('is-active'));
      b.classList.add('is-active');
      document.getElementById('tab-desc').hidden = b.dataset.tab !== 'desc';
      document.getElementById('tab-size').hidden = b.dataset.tab !== 'size';
    }));
  }

  async function renderReco(all, current){
    const el = document.getElementById('pdp-reco'); if (!el) return;
    const pool = all.filter(p=>p.sku!==current.sku && Object.values(p.stock||{}).some(n=>n>0));
    const sameBrand = pool.filter(p=>p.brand===current.brand);
    const tagMatch = pool.filter(p=> (p.tags||[]).some(t=> (current.tags||[]).includes(t)) );
    const base = [...sameBrand, ...tagMatch, ...pool].filter((p,i,self)=> self.indexOf(p)===i).slice(0,5);
    el.innerHTML = `<h2 class="reco-title">あなたにおすすめ</h2><div class="reco-row">${base.map(cardHTML).join('')}</div>`;
  }

  function cardHTML(p){
    const price = p.salePrice || p.price;
    return `<a class="reco-card" href="https://shop.bktys.com">
      <img src="${p.images?.[0]?.url||''}" alt="${p.images?.[0]?.alt||p.name}">
      <div class="reco-meta">
        <div class="reco-brand">${p.brand}</div>
        <div class="reco-name">${p.name}</div>
        <div class="reco-price">¥${price.toLocaleString()}</div>
      </div>
    </a>`;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    const slug = getSlug();
    const list = await fetchProducts();
    let p = slug ? bySlug(list, slug) : null;
    if(!p && list.length>0){ p = list[0]; }
    if(!p){
      const el = document.getElementById('pdp-root');
      if (el) el.textContent = '商品が見つかりませんでした';
      return;
    }
    render(p);
    renderReco(list, p);
  });
})();


