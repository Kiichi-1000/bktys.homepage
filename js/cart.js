// BKTYSSHOP Cart module (MVP, localStorage based)
(function(){
  // 送料ルール定数
  const SHIPPING_FREE_THRESHOLD = 10000;
  const SHIPPING_FLAT_JPY = 800;
  
  const STORE_KEY = 'bktys_cart_v1';

  // 送料計算
  function calcShipping(subtotal) {
    return subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT_JPY;
  }

  // 合計計算
  function calcTotal(subtotal, taxRate = 0.1) {
    const shipping = calcShipping(subtotal);
    const tax = Math.round(subtotal * taxRate);
    return { subtotal, shipping, tax, grand: subtotal + shipping + tax };
  }

  function load(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || { items: [] }; }
    catch(_e){ return { items: [] }; }
  }
  function save(cart){ localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }

  function calc(cart){
    const subtotal = cart.items.reduce((a,i)=>a + i.price * i.qty, 0);
    const shipping = calcShipping(subtotal);
    const total = subtotal + shipping;
    return { ...cart, subtotal, shipping, total };
  }

  function progress(subtotal){
    const remain = Math.max(0, SHIPPING_FREE_THRESHOLD - subtotal);
    const percent = Math.min(100, Math.round((subtotal / SHIPPING_FREE_THRESHOLD) * 100));
    return { remain, percent, isFree: remain === 0 };
  }

  function addItem(item){
    const cart = load();
    const found = cart.items.find(i=> i.sku===item.sku && i.size===item.size);
    if (found) found.qty += item.qty || 1; else cart.items.push({ ...item, qty:item.qty||1 });
    const c = calc(cart); 
    
    // 送料無料に達したかチェック
    const prevSubtotal = cart.subtotal || 0;
    const newSubtotal = c.subtotal;
    const prevShipping = calcShipping(prevSubtotal);
    const newShipping = calcShipping(newSubtotal);
    
    if (prevShipping > 0 && newShipping === 0) {
      // 送料無料に達した
      toast('🎉 送料無料になりました！', 'shipping-free');
      // ドーパミン刺激：送料無料達成エフェクト
      triggerDopamineEffect('shipping-free');
    }
    
    // ドーパミン刺激：商品追加エフェクト
    triggerDopamineEffect('add-to-cart');
    
    save(c); 
    return c;
  }

  function clear(){ save({ items: [] }); }

  // ドーパミン刺激エフェクト
  function triggerDopamineEffect(type) {
    switch(type) {
      case 'add-to-cart':
        // カートアイコンにドーパミンパルス効果
        const cartIcon = document.querySelector('.shop-cart, .future-cart-icon');
        if (cartIcon) {
          cartIcon.classList.add('dopamine-pulse');
          setTimeout(() => cartIcon.classList.remove('dopamine-pulse'), 2000);
        }
        break;
        
      case 'shipping-free':
        // 送料無料達成時の特別エフェクト
        const progressBar = document.querySelector('.cart-shipping-progress-fill');
        if (progressBar) {
          progressBar.classList.add('success-glow');
          setTimeout(() => progressBar.classList.remove('success-glow'), 1500);
        }
        break;
        
      case 'purchase-success':
        // 購入完了時のエフェクト
        showPurchaseSuccessOverlay();
        break;
        
      case 'achievement-unlock':
        // 達成感の演出
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement-unlock';
        achievementEl.innerHTML = '🏆 達成！';
        achievementEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;font-size:24px;color:#00C853;font-weight:bold;pointer-events:none;';
        document.body.appendChild(achievementEl);
        setTimeout(() => achievementEl.remove(), 2000);
        break;
    }
  }

  // 購入完了オーバーレイ
  function showPurchaseSuccessOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'purchase-success-overlay show';
    overlay.innerHTML = `
      <div class="purchase-success-content">
        <h2>🎉 購入完了！</h2>
        <p>ありがとうございます！</p>
        <p>商品の準備を開始します</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }, 3000);
  }

  function toast(message, type = 'default'){
    let el = document.getElementById('bktys-toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'bktys-toast';
      el.style.cssText = 'position:fixed;right:16px;top:16px;z-index:1000;background:#111;color:#fff;padding:12px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.25)';
      document.body.appendChild(el);
    }
    
    // 送料無料の場合は特別なスタイル
    if (type === 'shipping-free') {
      el.className = 'shipping-free-toast';
      el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--accent);color:#000;padding:12px 16px;border-radius:8px;font-weight:600;z-index:1001;box-shadow:0 4px 12px rgba(0,200,83,.3)';
    } else {
      el.className = '';
      el.style.cssText = 'position:fixed;right:16px;top:16px;z-index:1000;background:#111;color:#fff;padding:12px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.25)';
    }
    
    el.textContent = message;
    el.style.opacity = '1';
    
    // 送料無料の場合は3秒、通常は2.5秒
    const duration = type === 'shipping-free' ? 3000 : 2500;
    clearTimeout(el._t); 
    el._t = setTimeout(()=>{ 
      el.style.opacity = '0'; 
      // 送料無料の場合は要素を削除
      if (type === 'shipping-free') {
        setTimeout(() => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, 300);
      }
    }, duration);
  }

  // Public API
  window.BKTYSCart = {
    load, save, calc, progress, addItem, clear,
    constants: { SHIPPING_FREE_THRESHOLD, SHIPPING_FLAT_JPY },
    calcShipping, calcTotal,
    triggerDopamineEffect, showPurchaseSuccessOverlay
  };

  // header badge updater
  function updateBadge(){
    const badge = document.getElementById('cart-badge');
    if(!badge) return; const cnt = load().items.reduce((a,i)=>a+i.qty,0); badge.textContent = String(cnt);
  }
  document.addEventListener('DOMContentLoaded', updateBadge);
  window.addEventListener('storage', updateBadge);
  window.BKTYSCart.updateBadge = updateBadge;

  // Fly-to-cart animation utility (can be called from any page)
  window.BKTYSCart.flyToCartFrom = function(sourceEl){
    try{
      const img = sourceEl;
      const rect = img.getBoundingClientRect();
      const clone = img.cloneNode();
      clone.className = 'fly-clone';
      clone.style.left = rect.left + rect.width/2 + 'px';
      clone.style.top = rect.top + rect.height/2 + 'px';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      document.body.appendChild(clone);
      const badgeEl = document.getElementById('cart-badge');
      const emojiEl = document.querySelector('.shop-cart .cart-emoji') || badgeEl;
      const target = emojiEl?.getBoundingClientRect();
      if (!target){ setTimeout(()=>clone.remove(), 400); return; }
      const dx = target.left + target.width/2 - (rect.left + rect.width/2);
      const dy = target.top + target.height/2 - (rect.top + rect.height/2);
      const ox = dx * 1.15; // overshoot to emphasize motion
      const oy = dy * 1.15;
      return clone.animate([
        { transform: `translate(-50%,-50%) scale(1)`, opacity:1 },
        { transform: `translate(${dx*0.5}px, ${dy*0.5}px) scale(.6)`, opacity:.95, offset:.35 },
        { transform: `translate(${ox}px, ${oy}px) scale(.15)`, opacity:.6, offset:.75 },
        { transform: `translate(${dx}px, ${dy}px) scale(.05)`, opacity:0 }
      ], { duration: 1800, easing: 'cubic-bezier(.19,.9,.22,1)' }).finished.then(()=>{
        clone.remove();
        // bump emoji/badge
        (document.querySelector('.shop-cart .cart-emoji')||badgeEl).animate([
          { transform:'scale(1)' },
          { transform:'scale(1.35)' },
          { transform:'scale(1)' }
        ], { duration: 520, easing:'ease-out' });
      }).catch(()=>{ try{ clone.remove(); }catch(_){} });
    }catch(_e){ /* noop */ }
  }
})();
