// Main Sponsor Section Interactive Features
document.addEventListener('DOMContentLoaded', function() {
  const sponsorSection = document.querySelector('.main-sponsor');
  const sponsorCard = document.querySelector('.sponsor-card');
  const floatingLights = document.querySelectorAll('.floating-light');
  const bgPattern = document.querySelector('.bg-pattern');
  
  if (!sponsorSection) return;

  let isInteractive = false;
  let interactionTimeout;

  // カードホバー時の光の波紋効果
  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'sponsor-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    sponsorCard.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  // 光の粒の爆発効果
  function createLightBurst(x, y) {
    for (let i = 0; i < 8; i++) {
      const burst = document.createElement('div');
      burst.className = 'light-burst';
      burst.style.left = x + 'px';
      burst.style.top = y + 'px';
      burst.style.setProperty('--angle', (i * 45) + 'deg');
      burst.style.setProperty('--delay', (i * 0.1) + 's');
      
      sponsorSection.appendChild(burst);
      
      setTimeout(() => {
        burst.remove();
      }, 1500);
    }
  }

  // 花火エフェクト
  function createFirework(x, y) {
    // メインの花火
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    
    // ランダムな色を生成
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    firework.style.background = randomColor;
    firework.style.boxShadow = `0 0 20px ${randomColor}`;
    
    sponsorSection.appendChild(firework);
    
    // 花火の粒子を生成
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.background = randomColor;
      particle.style.boxShadow = `0 0 10px ${randomColor}`;
      
      // ランダムな方向に飛び散る
      const angle = (i * 30) + Math.random() * 30;
      const distance = 80 + Math.random() * 40;
      const dx = Math.cos(angle * Math.PI / 180) * distance;
      const dy = Math.sin(angle * Math.PI / 180) * distance;
      
      particle.style.setProperty('--dx', dx + 'px');
      particle.style.setProperty('--dy', dy + 'px');
      
      sponsorSection.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 1500);
    }
    
    setTimeout(() => {
      firework.remove();
    }, 2000);
  }

  // 背景パターンの動的変化
  function animateBgPattern() {
    if (bgPattern) {
      bgPattern.style.animation = 'bgPatternMove 8s ease-in-out';
      setTimeout(() => {
        bgPattern.style.animation = 'bgPatternMove 25s linear infinite';
      }, 8000);
    }
  }

  // 浮遊する光の粒の強化
  function enhanceFloatingLights() {
    floatingLights.forEach((light, index) => {
      light.style.animation = 'floatingLightEnhanced 3s ease-in-out';
      light.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(102, 126, 234, 0.8))';
      
      setTimeout(() => {
        light.style.animation = `floatingLight ${15 + index * 2}s ease-in-out infinite`;
        light.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(102, 126, 234, 0.4))';
      }, 3000);
    });
  }

  // カードの3D効果
  function add3DEffect(e) {
    const rect = sponsorCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    sponsorCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  }

  function remove3DEffect() {
    sponsorCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }

  // カードクリック時の効果
  sponsorCard.addEventListener('click', function(e) {
    const rect = sponsorCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createRipple(x, y);
    createLightBurst(x, y);
    animateBgPattern();
    enhanceFloatingLights();
    
    // カードの一時的な拡大
    sponsorCard.style.transform = 'scale(1.02)';
    setTimeout(() => {
      sponsorCard.style.transform = 'scale(1)';
    }, 200);
  });

  // セクション背景クリック時の花火効果
  sponsorSection.addEventListener('click', function(e) {
    // カード以外の場所をクリックした時のみ花火を発射
    if (!sponsorCard.contains(e.target)) {
      const rect = sponsorSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      createFirework(x, y);
      
      // 複数の花火を連続で発射（少しずつディレイを付けて）
      setTimeout(() => {
        const x2 = x + (Math.random() - 0.5) * 100;
        const y2 = y + (Math.random() - 0.5) * 100;
        createFirework(x2, y2);
      }, 200);
      
      setTimeout(() => {
        const x3 = x + (Math.random() - 0.5) * 100;
        const y3 = y + (Math.random() - 0.5) * 100;
        createFirework(x3, y3);
      }, 400);
    }
  });

  // カードホバー時の3D効果
  sponsorCard.addEventListener('mousemove', add3DEffect);
  sponsorCard.addEventListener('mouseleave', remove3DEffect);

  // セクション全体のホバー効果
  sponsorSection.addEventListener('mouseenter', function() {
    if (bgPattern) {
      bgPattern.style.opacity = '0.8';
    }
    
    floatingLights.forEach(light => {
      light.style.animationPlayState = 'paused';
      light.style.filter = 'brightness(1.2)';
    });
  });

  sponsorSection.addEventListener('mouseleave', function() {
    if (bgPattern) {
      bgPattern.style.opacity = '1';
    }
    
    floatingLights.forEach(light => {
      light.style.animationPlayState = 'running';
      light.style.filter = 'brightness(1)';
    });
    
    remove3DEffect();
  });

  // タッチデバイス対応
  let touchStartTime = 0;
  
  sponsorCard.addEventListener('touchstart', function(e) {
    touchStartTime = Date.now();
  });

  sponsorCard.addEventListener('touchend', function(e) {
    const touchDuration = Date.now() - touchStartTime;
    
    if (touchDuration < 300) { // タップ判定
      const touch = e.changedTouches[0];
      const rect = sponsorCard.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      createRipple(x, y);
      createLightBurst(x, y);
      animateBgPattern();
      enhanceFloatingLights();
    }
  });

  // セクション背景のタッチ対応
  sponsorSection.addEventListener('touchstart', function(e) {
    // カード以外の場所をタッチした時のみ処理
    if (!sponsorCard.contains(e.target)) {
      touchStartTime = Date.now();
    }
  });

  sponsorSection.addEventListener('touchend', function(e) {
    // カード以外の場所をタッチした時のみ花火を発射
    if (!sponsorCard.contains(e.target)) {
      const touchDuration = Date.now() - touchStartTime;
      
      if (touchDuration < 300) { // タップ判定
        const touch = e.changedTouches[0];
        const rect = sponsorSection.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        createFirework(x, y);
        
        // 複数の花火を連続で発射
        setTimeout(() => {
          const x2 = x + (Math.random() - 0.5) * 100;
          const y2 = y + (Math.random() - 0.5) * 100;
          createFirework(x2, y2);
        }, 200);
        
        setTimeout(() => {
          const x3 = x + (Math.random() - 0.5) * 100;
          const y3 = y + (Math.random() - 0.5) * 100;
          createFirework(x3, y3);
        }, 400);
      }
    }
  });

  // キーボード操作対応
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && document.activeElement === sponsorCard) {
      e.preventDefault();
      const rect = sponsorCard.getBoundingClientRect();
      createRipple(rect.width / 2, rect.height / 2);
      createLightBurst(rect.width / 2, rect.height / 2);
      animateBgPattern();
      enhanceFloatingLights();
    }
  });

  // スクロール時の視差効果
  let ticking = false;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (bgPattern) {
      bgPattern.style.transform = `translateY(${rate}px)`;
    }
    
    floatingLights.forEach((light, index) => {
      const lightRate = rate * (0.3 + index * 0.1);
      light.style.transform = `translateY(${lightRate}px)`;
    });
    
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick);
});
