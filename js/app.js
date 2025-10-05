// ===== BKTS Website JavaScript =====

// 動画の再生を確実にする
document.addEventListener('DOMContentLoaded', function() {
    function addPlayOnUserInteraction(video){
        const target = video.closest('.work__thumb') || video;
        const handler = function(){
            video.play().catch(function(e){ console.log('動画の再生に失敗しました:', e); });
        };
        // 端末のどこでもなく、動画周りの要素のみで再生を許可
        target.addEventListener('click', handler, { once:true });
        target.addEventListener('touchstart', handler, { once:true, passive:true });
    }
    const video = document.querySelector('.work__thumb video');
    if (video) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile){
            // スマホではいかなる場合も再生させない
            try{ video.pause(); }catch(_e){}
            video.autoplay = false;
            video.removeAttribute('autoplay');
            video.preload = 'none';
            video.muted = true;
            // 再生が呼ばれても即座に停止
            video.addEventListener('play', function(){ try{ video.pause(); }catch(_e){} }, true);
            return; // 以降の自動再生処理は実行しない
        }
        // 動画の読み込みが完了したら再生を試行
        video.addEventListener('loadedmetadata', function() {
            // 自動再生がブロックされた場合の処理
            video.play().catch(function(error) {
                console.log('動画の自動再生がブロックされました:', error);
                // 動画/そのコンテナへのインタラクションでのみ再生を許可
                addPlayOnUserInteraction(video);
            });
        });
        
        // 動画のエラーハンドリング
        video.addEventListener('error', function(e) {
            console.log('動画の読み込みエラー:', e);
        });
    }
});

// ===== モバイルHeroの画像切替間隔を常に一定にする =====
function setupMobileHeroEqualIntervals(){
  const mq = window.matchMedia('(max-width: 768px)');
  const apply = () => {
    const slidesWrap = document.querySelector('.hero .slides');
    if (!slidesWrap) return;
    if (!mq.matches){
      // PC時は初期設定を尊重（何もしない）
      // PCから戻る際のクラス除去
      slidesWrap.classList.remove('mobile-controlled');
      return;
    }
    const slidesAll = Array.from(slidesWrap.querySelectorAll('.slide'));
    // CSSで非表示(.mobile-hide)になっているものは除外
    const slides = slidesAll.filter(el => getComputedStyle(el).display !== 'none');
    if (slides.length === 0) return;

    // JSで完全制御（順番・等間隔）: CSSアニメーションを無効化し、is-active を順次付与
    slidesWrap.classList.add('mobile-controlled');
    slides.forEach(s=>{ s.classList.remove('is-active'); s.style.removeProperty('--d'); });
    let idx = 0;
    const holdMs = 3500; // 表示時間 3.5s（一定）
    const fadeMs = 500;  // フェード時間

    const tick = () => {
      // すべて非アクティブ
      slides.forEach(s=>s.classList.remove('is-active'));
      // 現在スライドを表示
      slides[idx].classList.add('is-active');
      // 次へ
      idx = (idx + 1) % slides.length;
    };
    // 初期表示
    tick();
    // 既存のインターバルをクリアしてから再設定（重複防止）
    if (slidesWrap._mobileTimer){ clearInterval(slidesWrap._mobileTimer); }
    slidesWrap._mobileTimer = setInterval(tick, holdMs + fadeMs);
  };
  apply();
  // 画面幅の変化で再計算
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  window.addEventListener('orientationchange', apply);
}

document.addEventListener('DOMContentLoaded', setupMobileHeroEqualIntervals);

// スクロールアニメーション
function handleScrollAnimation() {
    const elements = document.querySelectorAll('[data-scroll-animation]');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150; // 要素が画面の150px手前に来たときにアニメーション開始
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-in');
            
            // 動画要素の場合、フェードイン後に再生を開始
            const video = element.querySelector('video');
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (video && !isMobile && !video.hasAttribute('data-started')) {
                // フェードインアニメーションの完了を待ってから再生
                setTimeout(() => {
                    video.play().catch(function(error) {
                        console.log('動画の再生に失敗しました:', error);
                        // 動画/そのコンテナへのインタラクションでのみ再生を許可
                        addPlayOnUserInteraction(video);
                    });
                    video.setAttribute('data-started', 'true');
                }, 1800); // CSSのアニメーション時間（1.8秒）に合わせる
            }
        }
    });
}

// アニメーションのフォールバック処理
function enableAnimationFallback() {
    const elements = document.querySelectorAll('[data-scroll-animation]');
    
    // アニメーションが動作しない場合のフォールバック
    elements.forEach(element => {
        // 3秒後にアニメーションが動作していない場合は強制的に表示
        setTimeout(() => {
            if (!element.classList.contains('animate-in')) {
                element.classList.add('animate-in');
                console.log('アニメーションフォールバック: 要素を強制表示しました');
            }
        }, 3000);
    });
}

// アニメーションの動作確認
function checkAnimationSupport() {
    const testElement = document.createElement('div');
    testElement.style.transition = 'opacity 0.1s';
    testElement.style.opacity = '0';
    
    // アニメーションがサポートされているかテスト
    const supportsAnimation = 'transition' in testElement.style;
    
    if (!supportsAnimation) {
        console.log('アニメーションがサポートされていません。フォールバック処理を有効化します。');
        // アニメーションがサポートされていない場合は即座に表示
        const elements = document.querySelectorAll('[data-scroll-animation]');
        elements.forEach(element => {
            element.classList.add('animate-in');
        });
    }
    
    return supportsAnimation;
}

// スクロールイベントとリサイズイベントでアニメーションをチェック
window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('resize', handleScrollAnimation);

// 初期読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    // アニメーションサポートをチェック
    const animationSupported = checkAnimationSupport();
    
    if (animationSupported) {
        // 通常のアニメーション処理
        handleScrollAnimation();
        // フォールバック処理も有効化
        enableAnimationFallback();
    }
});
