// 注文管理システム
window.BKTYSOrders = {
  // 注文データの保存
  save: function(orderData) {
    try {
      const orders = this.load();
      orders.push(orderData);
      localStorage.setItem('bktys_orders', JSON.stringify(orders));
      return true;
    } catch (e) {
      console.error('注文の保存に失敗しました:', e);
      return false;
    }
  },

  // 注文データの読み込み
  load: function() {
    try {
      const orders = localStorage.getItem('bktys_orders');
      return orders ? JSON.parse(orders) : [];
    } catch (e) {
      console.error('注文の読み込みに失敗しました:', e);
      return [];
    }
  },

  // 注文番号で検索
  findByOrderNumber: function(orderNumber) {
    const orders = this.load();
    return orders.find(order => order.orderNumber === orderNumber);
  },

  // 注文の更新
  update: function(orderNumber, updates) {
    try {
      const orders = this.load();
      const index = orders.findIndex(order => order.orderNumber === orderNumber);
      
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        localStorage.setItem('bktys_orders', JSON.stringify(orders));
        return true;
      }
      return false;
    } catch (e) {
      console.error('注文の更新に失敗しました:', e);
      return false;
    }
  },

  // 注文の削除
  delete: function(orderNumber) {
    try {
      const orders = this.load();
      const filtered = orders.filter(order => order.orderNumber !== orderNumber);
      localStorage.setItem('bktys_orders', JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('注文の削除に失敗しました:', e);
      return false;
    }
  },

  // 注文履歴の表示
  renderHistory: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const orders = this.load();
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>まだ注文履歴がありません</p>
          <a href="https://shop.bktys.com" class="cta-button">ショップを見る</a>
        </div>
      `;
      return;
    }

    // 日付順でソート（新しい順）
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = `
      <h2>注文履歴 (${orders.length}件)</h2>
      <div class="orders-list">
        ${orders.map(order => this.renderOrderItem(order)).join('')}
      </div>
    `;

    // イベントリスナーを設定
    this.attachOrderEventListeners();
  },

  // 個別注文の表示
  renderOrderItem: function(order) {
    const date = new Date(order.date).toLocaleDateString('ja-JP');
    const status = this.getOrderStatus(order);
    
    return `
      <div class="order-item" data-order-number="${order.orderNumber}">
        <div class="order-header">
          <div class="order-info">
            <h3>注文番号: ${order.orderNumber}</h3>
            <p class="order-date">注文日: ${date}</p>
            <p class="order-status ${status.class}">${status.text}</p>
          </div>
          <div class="order-actions">
            <button class="btn-details" data-order="${order.orderNumber}">詳細</button>
            <button class="btn-cancel" data-order="${order.orderNumber}" ${status.cancellable ? '' : 'disabled'}>キャンセル</button>
          </div>
        </div>
        <div class="order-summary">
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-product">
                <span>${item.name} (${item.size}) × ${item.qty}</span>
                <span>¥${(item.price * item.qty).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            <strong>合計: ¥${order.total.toLocaleString()}</strong>
          </div>
        </div>
        <div class="order-details" style="display: none;">
          <div class="shipping-info">
            <h4>配送先</h4>
            <p>${order.shipping.name}<br>
            ${order.shipping.email}<br>
            ${order.shipping.phone}<br>
            〒${order.shipping.postal}<br>
            ${order.shipping.address}</p>
          </div>
          <div class="payment-info">
            <h4>支払い方法</h4>
            <p>${this.getPaymentMethodText(order.paymentMethod)}</p>
          </div>
          <div class="shipping-method">
            <h4>配送方法</h4>
            <p>${this.getShippingMethodText(order.shippingMethod)}</p>
          </div>
        </div>
      </div>
    `;
  },

  // 注文ステータスの取得
  getOrderStatus: function(order) {
    const now = new Date();
    const orderDate = new Date(order.date);
    const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);

    if (daysDiff < 1) {
      return { text: '処理中', class: 'status-processing', cancellable: true };
    } else if (daysDiff < 3) {
      return { text: '発送準備中', class: 'status-preparing', cancellable: true };
    } else if (daysDiff < 7) {
      return { text: '発送済み', class: 'status-shipped', cancellable: false };
    } else {
      return { text: '完了', class: 'status-completed', cancellable: false };
    }
  },

  // 支払い方法のテキスト取得
  getPaymentMethodText: function(method) {
    const methods = {
      credit: 'クレジットカード',
      convenience: 'コンビニ決済',
      bank: '銀行振込'
    };
    return methods[method] || method;
  },

  // 配送方法のテキスト取得
  getShippingMethodText: function(method) {
    const methods = {
      standard: '通常便（3-5日）',
      express: '速達便（1-2日）'
    };
    return methods[method] || method;
  },

  // イベントリスナーの設定
  attachOrderEventListeners: function() {
    // 詳細表示/非表示
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', function() {
        const orderNumber = this.dataset.order;
        const orderItem = document.querySelector(`[data-order-number="${orderNumber}"]`);
        const details = orderItem.querySelector('.order-details');
        
        if (details.style.display === 'none') {
          details.style.display = 'block';
          this.textContent = '閉じる';
        } else {
          details.style.display = 'none';
          this.textContent = '詳細';
        }
      });
    });

    // キャンセル処理
    document.querySelectorAll('.btn-cancel').forEach(btn => {
      btn.addEventListener('click', function() {
        if (this.disabled) return;
        
        const orderNumber = this.dataset.order;
        if (confirm(`注文番号 ${orderNumber} をキャンセルしますか？`)) {
          if (BKTYSOrders.cancelOrder(orderNumber)) {
            alert('注文をキャンセルしました');
            // ページを再読み込みして表示を更新
            location.reload();
          } else {
            alert('キャンセルに失敗しました');
          }
        }
      });
    });
  },

  // 注文のキャンセル
  cancelOrder: function(orderNumber) {
    try {
      const order = this.findByOrderNumber(orderNumber);
      if (!order) return false;

      // キャンセル可能かチェック
      const status = this.getOrderStatus(order);
      if (!status.cancellable) return false;

      // 注文をキャンセル済みに更新
      order.status = 'cancelled';
      order.cancelledAt = new Date().toISOString();
      
      return this.update(orderNumber, order);
    } catch (e) {
      console.error('注文のキャンセルに失敗しました:', e);
      return false;
    }
  },

  // 注文統計の取得
  getStats: function() {
    const orders = this.load();
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    
    return {
      total: orders.length,
      active: activeOrders.length,
      cancelled: orders.length - activeOrders.length,
      totalRevenue: activeOrders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: activeOrders.length > 0 ? 
        activeOrders.reduce((sum, order) => sum + order.total, 0) / activeOrders.length : 0
    };
  },

  // 注文統計の表示
  renderStats: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = this.getStats();
    
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">総注文数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.active}</div>
          <div class="stat-label">有効注文</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">¥${stats.totalRevenue.toLocaleString()}</div>
          <div class="stat-label">総売上</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">¥${Math.round(stats.averageOrderValue).toLocaleString()}</div>
          <div class="stat-label">平均注文額</div>
        </div>
      </div>
    `;
  },

  // 注文データのエクスポート
  exportOrders: function() {
    try {
      const orders = this.load();
      const dataStr = JSON.stringify(orders, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `bktys-orders-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('注文データのエクスポートに失敗しました:', e);
      return false;
    }
  },

  // 注文データのクリア（開発用）
  clearAll: function() {
    if (confirm('すべての注文データを削除しますか？この操作は取り消せません。')) {
      localStorage.removeItem('bktys_orders');
      alert('すべての注文データを削除しました');
      return true;
    }
    return false;
  }
};

// 注文管理ページ用のスタイル
const orderStyles = `
  .orders-list { margin-top: 20px; }
  .order-item { 
    border: 1px solid #e5e7eb; 
    border-radius: 8px; 
    margin-bottom: 16px; 
    overflow: hidden; 
  }
  .order-header { 
    background: #f9fafb; 
    padding: 16px; 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
  }
  .order-info h3 { margin: 0 0 8px 0; font-size: 18px; }
  .order-date, .order-status { margin: 4px 0; font-size: 14px; }
  .order-status { font-weight: 600; }
  .status-processing { color: #f59e0b; }
  .status-preparing { color: #3b82f6; }
  .status-shipped { color: #10b981; }
  .status-completed { color: #059669; }
  .order-actions { display: flex; gap: 8px; }
  .btn-details, .btn-cancel { 
    padding: 8px 16px; 
    border: none; 
    border-radius: 6px; 
    cursor: pointer; 
    font-size: 14px; 
  }
  .btn-details { background: #3b82f6; color: white; }
  .btn-cancel { background: #ef4444; color: white; }
  .btn-cancel:disabled { background: #9ca3af; cursor: not-allowed; }
  .order-summary { 
    padding: 16px; 
    border-top: 1px solid #e5e7eb; 
  }
  .order-product { 
    display: flex; 
    justify-content: space-between; 
    margin-bottom: 8px; 
    padding-bottom: 8px; 
    border-bottom: 1px solid #f3f4f6; 
  }
  .order-product:last-child { border-bottom: none; margin-bottom: 0; }
  .order-total { 
    text-align: right; 
    margin-top: 16px; 
    padding-top: 16px; 
    border-top: 2px solid #e5e7eb; 
  }
  .order-details { 
    padding: 16px; 
    background: #f9fafb; 
    border-top: 1px solid #e5e7eb; 
  }
  .shipping-info, .payment-info, .shipping-method { margin-bottom: 16px; }
  .shipping-info h4, .payment-info h4, .shipping-method h4 { 
    margin: 0 0 8px 0; 
    font-size: 16px; 
    color: #374151; 
  }
  .stats-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
    gap: 16px; 
    margin: 20px 0; 
  }
  .stat-item { 
    text-align: center; 
    padding: 20px; 
    background: white; 
    border: 1px solid #e5e7eb; 
    border-radius: 8px; 
  }
  .stat-number { 
    font-size: 24px; 
    font-weight: 700; 
    color: #1f2937; 
    margin-bottom: 8px; 
  }
  .stat-label { 
    font-size: 14px; 
    color: #6b7280; 
  }
  .empty-state { 
    text-align: center; 
    padding: 40px 20px; 
    color: #6b7280; 
  }
  .cta-button { 
    display: inline-block; 
    margin-top: 16px; 
    padding: 12px 24px; 
    background: #3b82f6; 
    color: white; 
    text-decoration: none; 
    border-radius: 6px; 
    font-weight: 600; 
  }
`;

// スタイルをページに追加
if (!document.getElementById('order-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'order-styles';
  styleEl.textContent = orderStyles;
  document.head.appendChild(styleEl);
}







