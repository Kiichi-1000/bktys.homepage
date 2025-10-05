// News Filter and Pagination Functionality
document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const newsItems = document.querySelectorAll('.news-item');
  const pageBtns = document.querySelectorAll('.page-btn');
  
  // ニュースフィルタリング機能
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      
      // アクティブボタンの切り替え
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // ニュースアイテムのフィルタリング
      newsItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
  
  // ページネーション機能
  pageBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.classList.contains('active')) return;
      
      // アクティブページの切り替え
      pageBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // ページトップにスムーズスクロール
      document.querySelector('.news-content').scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  // フェードインアニメーション用のCSSアニメーション
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
});
