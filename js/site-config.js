// BKTYSSHOP サイト設定ファイル
// このファイルを編集することで、サイトの基本設定を変更できます

window.SITE_CONFIG = {
  // 基本情報
  site: {
    name: 'BKTYSSHOP',
    description: 'BKTYS公式オンラインショップ',
    currency: 'JPY',
    language: 'ja'
  },

  // 決済設定（あなたが選択・設定する必要があります）
  payment: {
    // 決済プロバイダー: 'stripe', 'paypal', 'convenience', 'bank' から選択
    provider: 'stripe',
    
    // Stripe設定（stripeを選択した場合）
    stripe: {
      publicKey: 'YOUR_STRIPE_PUBLIC_KEY', // あなたが設定
      currency: 'jpy',
      locale: 'ja'
    },
    
    // PayPal設定（paypalを選択した場合）
    paypal: {
      clientId: 'YOUR_PAYPAL_CLIENT_ID', // あなたが設定
      currency: 'JPY',
      locale: 'ja_JP'
    },
    
    // 利用可能な決済方法
    methods: [
      { id: 'credit', name: 'クレジットカード', enabled: true },
      { id: 'convenience', name: 'コンビニ決済', enabled: true },
      { id: 'bank', name: '銀行振込', enabled: true }
    ]
  },

  // 配送設定（あなたが確定する必要があります）
  shipping: {
    // 基本送料
    basePrice: 800,
    
    // 送料無料の閾値
    freeThreshold: 10000,
    
    // 配送方法
    methods: [
      {
        id: 'standard',
        name: '通常便',
        price: 800,
        days: '3-5日',
        description: '標準的な配送速度',
        enabled: true
      },
      {
        id: 'express',
        name: '速達便',
        price: 1200,
        days: '1-2日',
        description: '急ぎの場合はこちら',
        enabled: true
      }
    ],
    
    // 配送可能地域
    regions: ['JP'], // 現在は日本国内のみ
    
    // 配送業者（後で設定）
    carriers: [
      'ヤマト運輸',
      '佐川急便',
      '日本郵便'
    ]
  },

  // 商品設定
  products: {
    // 在庫管理
    stockManagement: true,
    
    // 在庫不足時の表示
    lowStockThreshold: 5,
    
    // 商品画像の設定
    images: {
      maxWidth: 1200,
      formats: ['webp', 'jpg'],
      quality: 85
    },
    
    // 商品カテゴリ
    categories: [
      'tee', 'hoodie', 'accessory', 'limited'
    ]
  },

  // カート設定
  cart: {
    // カートの有効期限（日）
    expirationDays: 30,
    
    // 最大商品数
    maxItems: 99,
    
    // 数量変更の制限
    quantityLimit: {
      min: 1,
      max: 10
    }
  },

  // 注文設定
  order: {
    // 注文番号のプレフィックス
    numberPrefix: 'ORD',
    
    // 注文の有効期限（分）
    expirationMinutes: 30,
    
    // 注文確認メール
    confirmationEmail: true,
    
    // 注文履歴の保存期間（日）
    historyRetentionDays: 365
  },

  // 会員設定（後で実装予定）
  membership: {
    enabled: false,
    benefits: {
      discount: 0.1, // 10%割引
      freeShipping: true,
      earlyAccess: true
    }
  },

  // 分析・トラッキング
  analytics: {
    // Google Analytics
    googleAnalytics: {
      enabled: false,
      trackingId: 'YOUR_GA_TRACKING_ID' // あなたが設定
    },
    
    // その他の分析ツール
    other: {
      enabled: false,
      config: {}
    }
  },

  // 開発・テスト設定
  development: {
    // テストモード
    testMode: true,
    
    // デバッグログ
    debugLog: true,
    
    // モックデータの使用
    useMockData: true
  }
};

// 設定の取得用ヘルパー関数
window.getConfig = function(path) {
  const keys = path.split('.');
  let value = window.SITE_CONFIG;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// 設定の更新用ヘルパー関数
window.updateConfig = function(path, newValue) {
  const keys = path.split('.');
  let current = window.SITE_CONFIG;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  current[lastKey] = newValue;
  
  // 設定をローカルストレージに保存
  localStorage.setItem('bktys_site_config', JSON.stringify(window.SITE_CONFIG));
};

// 設定の初期化（ローカルストレージから復元）
document.addEventListener('DOMContentLoaded', function() {
  const savedConfig = localStorage.getItem('bktys_site_config');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      Object.assign(window.SITE_CONFIG, parsed);
    } catch (e) {
      console.warn('保存された設定の読み込みに失敗しました:', e);
    }
  }
  
  // 開発モードの設定
  if (window.SITE_CONFIG.development.testMode) {
    console.log('BKTYSSHOP 設定:', window.SITE_CONFIG);
  }
});

// 設定のエクスポート
window.exportConfig = function() {
  const configStr = JSON.stringify(window.SITE_CONFIG, null, 2);
  const blob = new Blob([configStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bktys-site-config.json';
  a.click();
  
  URL.revokeObjectURL(url);
};

// 設定のインポート
window.importConfig = function(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const config = JSON.parse(e.target.result);
      Object.assign(window.SITE_CONFIG, config);
      localStorage.setItem('bktys_site_config', JSON.stringify(window.SITE_CONFIG));
      alert('設定をインポートしました。ページを再読み込みしてください。');
    } catch (e) {
      alert('設定ファイルの読み込みに失敗しました: ' + e.message);
    }
  };
  reader.readAsText(file);
};







