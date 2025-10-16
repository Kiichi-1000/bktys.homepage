// 商品データのフォールバック（products.jsonが読み込めない場合用）
window.BK_PRODUCTS = [
  // Official Line
  {
    id: 'OFF-001',
    sku: 'OFF-001',
    slug: 'official-basic-tee',
    name: 'Official Basic Tee',
    brand: 'BKTYS Official',
    price: 4500,
    salePrice: null,
    images: [
      { url: 'assets/images/S__23273487.jpg', alt: 'Official Basic Tee' },
      { url: 'assets/images/S__23273486.jpg', alt: 'Official Basic Tee Back' }
    ],
    tags: ['official', 'tee', 'basic'],
    category: 'tee',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 15, M: 20, L: 18, XL: 12 },
    description: 'BKTYS公式のベーシックTシャツ。高品質コットンを使用し、快適な着心地を提供します。',
    sizeGuide: 'S: 着丈65/身幅48, M: 69/52, L: 73/55, XL: 77/58 (cm)',
    deliveryEstimate: '2-3週間',
    producer: 'Made in Japan',
    rank_score: 95
  },
  {
    id: 'OFF-002',
    sku: 'OFF-002',
    slug: 'official-hoodie',
    name: 'Official Hoodie',
    brand: 'BKTYS Official',
    price: 8500,
    salePrice: null,
    images: [
      { url: 'assets/images/S__23273484.jpg', alt: 'Official Hoodie' },
      { url: 'assets/images/S__23273486.jpg', alt: 'Official Hoodie Back' }
    ],
    tags: ['official', 'hoodie', 'winter'],
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 8, M: 12, L: 10, XL: 6 },
    description: 'BKTYS公式フーディー。厚手の生地で寒い日も暖かく、スタイリッシュなデザイン。',
    sizeGuide: 'S: 着丈68/身幅52, M: 72/56, L: 76/60, XL: 80/64 (cm)',
    deliveryEstimate: '2-3週間',
    producer: 'Made in Japan',
    rank_score: 88
  },
  {
    id: 'OFF-003',
    sku: 'OFF-003',
    slug: 'official-cap',
    name: 'Official Cap',
    brand: 'BKTYS Official',
    price: 2800,
    salePrice: null,
    images: [
      { url: 'assets/images/38559702-759D-49DD-9888-5565350877A9.jpg', alt: 'Official Cap' }
    ],
    tags: ['official', 'cap', 'accessory'],
    category: 'accessory',
    sizes: ['ONE SIZE'],
    stock: { 'ONE SIZE': 25 },
    description: 'BKTYS公式キャップ。軽量で通気性が良く、日常使いに最適。',
    sizeGuide: 'ONE SIZE: 頭囲57-59cm',
    deliveryEstimate: '1-2週間',
    producer: 'Made in Japan',
    rank_score: 92
  },
  {
    id: 'OFF-004',
    sku: 'OFF-004',
    slug: 'official-bag',
    name: 'Official Tote Bag',
    brand: 'BKTYS Official',
    price: 3200,
    salePrice: null,
    images: [
      { url: 'assets/images/C5C2533F-68D4-40A9-85C8-6E6C351CC3BA.jpg', alt: 'Official Tote Bag' }
    ],
    tags: ['official', 'bag', 'accessory'],
    category: 'accessory',
    sizes: ['ONE SIZE'],
    stock: { 'ONE SIZE': 18 },
    description: 'BKTYS公式トートバッグ。丈夫な生地で、買い物や通勤に便利。',
    sizeGuide: 'ONE SIZE: 幅40×高さ35×マチ12cm',
    deliveryEstimate: '1-2週間',
    producer: 'Made in Japan',
    rank_score: 85
  },
  {
    id: 'OFF-005',
    sku: 'OFF-005',
    slug: 'official-patch',
    name: 'Official Patch Set',
    brand: 'BKTYS Official',
    price: 1200,
    salePrice: null,
    images: [
      { url: 'assets/images/55831B31-0733-43AD-BE72-B0952DF21654.jpg', alt: 'Official Patch Set' }
    ],
    tags: ['official', 'patch', 'accessory'],
    category: 'accessory',
    sizes: ['ONE SIZE'],
    stock: { 'ONE SIZE': 30 },
    description: 'BKTYS公式パッチセット。バッグやジャケットに取り付けてオリジナリティを演出。',
    sizeGuide: 'ONE SIZE: 各パッチ約3×3cm',
    deliveryEstimate: '1週間',
    producer: 'Made in Japan',
    rank_score: 78
  },

  // Students Line
  {
    id: 'STU-001',
    sku: 'STU-001',
    slug: 'student-creative-tee',
    name: 'Student Creative Tee',
    brand: 'BKTYS Students',
    price: 3800,
    salePrice: null,
    images: [
      { url: 'assets/images/S__23273486.jpg', alt: 'Student Creative Tee' },
      { url: 'assets/images/S__23273487.jpg', alt: 'Student Creative Tee Back' }
    ],
    tags: ['students', 'tee', 'creative'],
    category: 'tee',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 10, M: 15, L: 12, XL: 8 },
    description: '学生デザイナーによるクリエイティブTシャツ。個性的なデザインで注目を集めます。',
    sizeGuide: 'S: 着丈66/身幅49, M: 70/53, L: 74/57, XL: 78/61 (cm)',
    deliveryEstimate: '3-4週間',
    producer: 'Student Design',
    rank_score: 82
  },
  {
    id: 'STU-002',
    sku: 'STU-002',
    slug: 'student-zip-hoodie',
    name: 'Student Zip Hoodie',
    brand: 'BKTYS Students',
    price: 7200,
    salePrice: null,
    images: [
      { url: 'assets/images/S__23273484.jpg', alt: 'Student Zip Hoodie' }
    ],
    tags: ['students', 'hoodie', 'zip'],
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 6, M: 10, L: 8, XL: 5 },
    description: '学生デザイナーによるジップアップフーディー。モダンなデザインと機能性を両立。',
    sizeGuide: 'S: 着丈70/身幅54, M: 74/58, L: 78/62, XL: 82/66 (cm)',
    deliveryEstimate: '3-4週間',
    producer: 'Student Design',
    rank_score: 79
  },
  {
    id: 'STU-003',
    sku: 'STU-003',
    slug: 'student-print-tee',
    name: 'Student Print Tee',
    brand: 'BKTYS Students',
    price: 4200,
    salePrice: null,
    images: [
      { url: 'assets/images/38559702-759D-49DD-9888-5565350877A9.jpg', alt: 'Student Print Tee' }
    ],
    tags: ['students', 'tee', 'print'],
    category: 'tee',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 8, M: 12, L: 10, XL: 6 },
    description: '学生デザイナーによるプリントTシャツ。アート性の高いデザインで個性を表現。',
    sizeGuide: 'S: 着丈67/身幅50, M: 71/54, L: 75/58, XL: 79/62 (cm)',
    deliveryEstimate: '3-4週間',
    producer: 'Student Design',
    rank_score: 76
  },
  {
    id: 'STU-004',
    sku: 'STU-004',
    slug: 'student-accessory-set',
    name: 'Student Accessory Set',
    brand: 'BKTYS Students',
    price: 1800,
    salePrice: null,
    images: [
      { url: 'assets/images/C5C2533F-68D4-40A9-85C8-6E6C351CC3BA.jpg', alt: 'Student Accessory Set' }
    ],
    tags: ['students', 'accessory', 'set'],
    category: 'accessory',
    sizes: ['ONE SIZE'],
    stock: { 'ONE SIZE': 20 },
    description: '学生デザイナーによるアクセサリーセット。オリジナルデザインの小物でコーディネートを完成。',
    sizeGuide: 'ONE SIZE: 各種サイズ',
    deliveryEstimate: '2-3週間',
    producer: 'Student Design',
    rank_score: 73
  },

  // Limited Edition
  {
    id: 'LIM-001',
    sku: 'LIM-001',
    slug: 'limited-championship-tee',
    name: 'Limited Championship Tee',
    brand: 'BKTYS Limited',
    price: 5500,
    salePrice: null,
    images: [
      { url: 'assets/images/55831B31-0733-43AD-BE72-B0952DF21654.jpg', alt: 'Limited Championship Tee' }
    ],
    tags: ['limited', 'tee', 'championship'],
    category: 'tee',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 5, M: 8, L: 6, XL: 4 },
    description: '選手権記念限定Tシャツ。特別なデザインで記念に残る一枚。',
    sizeGuide: 'S: 着丈68/身幅51, M: 72/55, L: 76/59, XL: 80/63 (cm)',
    deliveryEstimate: '2-3週間',
    producer: 'Limited Edition',
    rank_score: 98
  },
  {
    id: 'LIM-002',
    sku: 'LIM-002',
    slug: 'limited-anniversary-hoodie',
    name: 'Limited Anniversary Hoodie',
    brand: 'BKTYS Limited',
    price: 9800,
    salePrice: null,
    images: [
      { url: 'assets/images/S__23273484.jpg', alt: 'Limited Anniversary Hoodie' }
    ],
    tags: ['limited', 'hoodie', 'anniversary'],
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 3, M: 5, L: 4, XL: 2 },
    description: '記念日限定フーディー。特別な刺繍と高級素材で作られた記念品。',
    sizeGuide: 'S: 着丈70/身幅55, M: 74/59, L: 78/63, XL: 82/67 (cm)',
    deliveryEstimate: '3-4週間',
    producer: 'Limited Edition',
    rank_score: 96
  }
];

// ニュースデータのフォールバック
window.BK_NEWS = [
  {
    title: '選手権優勝記念商品発売',
    date: '2024-12-01',
    category: 'リリース',
    coverImageUrl: 'assets/images/38559702-759D-49DD-9888-5565350877A9.jpg'
  },
  {
    title: '学生デザイナー募集開始',
    date: '2024-11-25',
    category: 'お知らせ',
    coverImageUrl: 'assets/images/S__23273486.jpg'
  },
  {
    title: '新商品ラインアップ発表',
    date: '2024-11-20',
    category: 'リリース',
    coverImageUrl: 'assets/images/S__23273484.jpg'
  },
  {
    title: 'オンラインショップオープン',
    date: '2024-11-15',
    category: 'お知らせ',
    coverImageUrl: 'assets/images/C5C2533F-68D4-40A9-85C8-6E6C351CC3BA.jpg'
  }
];
