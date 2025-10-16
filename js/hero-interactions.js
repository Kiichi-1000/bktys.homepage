// Hero Section Interactive Features
document.addEventListener('DOMContentLoaded', function() {
  const heroSection = document.querySelector('.introduction-hero');
  const heroBackground = document.querySelector('.hero-background');
  const particles = document.querySelectorAll('.hero-particles .particle');
  
  if (!heroSection) return;

  let isInteractive = false;
  let interactionTimeout;

  // パーティクルタップ/ホバー効果
  particles.forEach(particle => {
    // タッチデバイス用
    particle.addEventListener('touchstart', handleParticleInteraction);
    particle.addEventListener('touchend', handleParticleRelease);
    
    // マウス用
    particle.addEventListener('mouseenter', handleParticleInteraction);
    particle.addEventListener('mouseleave', handleParticleRelease);
    
    // クリック用
    particle.addEventListener('click', handleParticleClick);
  });

  // パーティクルインタラクション処理
  function handleParticleInteraction(e) {
    const particle = e.target;
    particle.classList.add('interactive');
    
    // パーティクルバースト効果
    createParticleBurst(particle);
    
    // 背景色変更
    heroSection.classList.add('interactive');
    
    // インタラクション状態をリセット
    clearTimeout(interactionTimeout);
    interactionTimeout = setTimeout(() => {
      heroSection.classList.remove('interactive');
    }, 2000);
  }

  // パーティクルリリース処理
  function handleParticleRelease(e) {
    const particle = e.target;
    particle.classList.remove('interactive');
  }

  // パーティクルクリック処理
  function handleParticleClick(e) {
    const particle = e.target;
    
    // クリック位置にパーティクル増殖
    for (let i = 0; i < 8; i++) {
      createClickParticle(e.clientX, e.clientY);
    }
    
    // パーティクルを一時的に無効化
    particle.style.pointerEvents = 'none';
    setTimeout(() => {
      particle.style.pointerEvents = 'auto';
    }, 1000);
  }

  // パーティクルバースト作成
  function createParticleBurst(particle) {
    const rect = particle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
      const burstParticle = document.createElement('div');
      burstParticle.className = 'particle-burst';
      burstParticle.style.left = centerX + 'px';
      burstParticle.style.top = centerY + 'px';
      
      // ランダムな方向に飛び散る
      const angle = (i * 60) + Math.random() * 30;
      const distance = 30 + Math.random() * 20;
      const endX = centerX + Math.cos(angle * Math.PI / 180) * distance;
      const endY = centerY + Math.sin(angle * Math.PI / 180) * distance;
      
      burstParticle.style.setProperty('--end-x', endX + 'px');
      burstParticle.style.setProperty('--end-y', endY + 'px');
      
      document.body.appendChild(burstParticle);
      
      // アニメーション終了後に要素を削除
      setTimeout(() => {
        if (burstParticle.parentNode) {
          burstParticle.parentNode.removeChild(burstParticle);
        }
      }, 1000);
    }
  }

  // クリックパーティクル作成
  function createClickParticle(x, y) {
    const clickParticle = document.createElement('div');
    clickParticle.className = 'particle-burst';
    clickParticle.style.left = x + 'px';
    clickParticle.style.top = y + 'px';
    clickParticle.style.background = `hsl(${Math.random() * 360}, 70%, 70%)`;
    
    document.body.appendChild(clickParticle);
    
    // ランダムな方向に飛び散る
    const angle = Math.random() * 360;
    const distance = 50 + Math.random() * 50;
    const endX = x + Math.cos(angle * Math.PI / 180) * distance;
    const endY = y + Math.sin(angle * Math.PI / 180) * distance;
    
    clickParticle.style.setProperty('--end-x', endX + 'px');
    clickParticle.style.setProperty('--end-y', endY + 'px');
    
    // アニメーション終了後に要素を削除
    setTimeout(() => {
      if (clickParticle.parentNode) {
        clickParticle.parentNode.removeChild(clickParticle);
      }
    }, 1000);
  }

  // 背景タップ/ホバー効果
  heroBackground.addEventListener('click', handleBackgroundInteraction);
  heroBackground.addEventListener('mouseenter', handleBackgroundInteraction);
  heroBackground.addEventListener('mouseleave', handleBackgroundRelease);

  function handleBackgroundInteraction(e) {
    if (e.type === 'click') {
      // クリック位置に波紋効果
      createRippleEffect(e.clientX, e.clientY);
      
      // クリックで色を切り替え
      if (heroSection.classList.contains('interactive')) {
        // 既にインタラクティブな場合は元に戻す
        heroSection.classList.remove('interactive');
      } else {
        // インタラクティブでない場合は色を変更
        heroSection.classList.add('interactive');
      }
    } else {
      // ホバー時は従来通り
      heroSection.classList.add('interactive');
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        heroSection.classList.remove('interactive');
      }, 3000);
    }
  }

  function handleBackgroundRelease() {
    // マウスが離れた時の処理（必要に応じて）
  }

  // 波紋効果作成
  function createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border: 2px solid rgba(255,255,255,0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1000;
      animation: ripple 1s ease-out forwards;
    `;
    
    document.body.appendChild(ripple);
    
    // アニメーション終了後に要素を削除
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 1000);
  }

  // キーボードインタラクション
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      heroSection.classList.add('interactive');
      
      // 全パーティクルを一時的に強調
      particles.forEach(particle => {
        particle.classList.add('interactive');
        setTimeout(() => {
          particle.classList.remove('interactive');
        }, 1000);
      });
      
      setTimeout(() => {
        heroSection.classList.remove('interactive');
      }, 2000);
    }
  });

  // スクロールインタラクション
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (isElementInViewport(heroSection)) {
      heroSection.classList.add('interactive');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        heroSection.classList.remove('interactive');
      }, 1500);
    }
  });

  // 要素がビューポート内にあるかチェック
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
});
