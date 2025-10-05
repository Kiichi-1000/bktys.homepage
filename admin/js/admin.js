// 管理画面のメインJavaScript
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.orders = [];
        this.printfulProducts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.loadData();
    }

    setupEventListeners() {
        // ログイン
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // ログアウト
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // ナビゲーション
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

        // 商品追加
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showProductModal();
        });

        // 商品フォーム
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        // モーダル閉じる
        document.querySelector('.close').addEventListener('click', () => {
            this.hideProductModal();
        });

        document.getElementById('cancel-product').addEventListener('click', () => {
            this.hideProductModal();
        });

        // 発注先変更
        document.getElementById('product-provider').addEventListener('change', (e) => {
            this.togglePrintfulVariant(e.target.value);
        });

        // Printful同期
        document.getElementById('sync-printful-btn').addEventListener('click', () => {
            this.syncPrintfulProducts();
        });

        // 設定保存
        document.getElementById('save-printful-token').addEventListener('click', () => {
            this.savePrintfulToken();
        });

        document.getElementById('save-base-secret').addEventListener('click', () => {
            this.saveBaseSecret();
        });

        // 注文フィルター
        document.getElementById('order-status-filter').addEventListener('change', (e) => {
            this.filterOrders(e.target.value);
        });
    }

    checkAuth() {
        const token = localStorage.getItem('admin_token');
        if (token) {
            this.currentUser = { username: 'admin' };
            this.showAdminMain();
        } else {
            this.showLoginScreen();
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // 簡単な認証（本番では適切な認証を実装）
        if (username === 'admin' && password === 'admin123') {
            this.currentUser = { username };
            localStorage.setItem('admin_token', 'dummy_token');
            this.showAdminMain();
        } else {
            alert('ユーザー名またはパスワードが正しくありません');
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('admin_token');
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-main').style.display = 'none';
    }

    showAdminMain() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-main').style.display = 'flex';
        this.updateDashboard();
    }

    showSection(sectionName) {
        // ナビゲーションのアクティブ状態を更新
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // セクションの表示を更新
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // セクション固有の処理
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'printful':
                this.loadPrintfulProducts();
                break;
        }
    }

    updateDashboard() {
        // ダッシュボードの統計を更新
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.created_at).toDateString() === today
        );
        
        document.getElementById('today-orders').textContent = todayOrders.length;
        
        const monthlySales = this.orders.reduce((sum, order) => {
            const orderDate = new Date(order.created_at);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                return sum + order.total;
            }
            return sum;
        }, 0);
        
        document.getElementById('monthly-sales').textContent = `¥${monthlySales.toLocaleString()}`;
        
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        document.getElementById('pending-orders').textContent = pendingOrders;
        
        document.getElementById('total-products').textContent = this.products.length;
    }

    loadProducts() {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image || '/admin/images/placeholder.jpg'}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">¥${product.price.toLocaleString()}</div>
                <div class="product-provider">${this.getProviderName(product.provider)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="admin.editProduct('${product.id}')">編集</button>
                    <button class="btn btn-secondary btn-small" onclick="admin.deleteProduct('${product.id}')">削除</button>
                </div>
            </div>
        `;
        return card;
    }

    getProviderName(provider) {
        const providers = {
            'printful': 'Printful',
            'paintry': 'Paintry (BASE連携)',
            'manual': '手動発注'
        };
        return providers[provider] || provider;
    }

    loadOrders() {
        const ordersTbody = document.getElementById('orders-tbody');
        ordersTbody.innerHTML = '';

        this.orders.forEach(order => {
            const row = this.createOrderRow(order);
            ordersTbody.appendChild(row);
        });
    }

    createOrderRow(order) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer_name}</td>
            <td>${order.items.map(item => item.name).join(', ')}</td>
            <td>¥${order.total.toLocaleString()}</td>
            <td><span class="status-badge status-${order.status}">${this.getStatusName(order.status)}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="admin.viewOrder('${order.id}')">詳細</button>
                ${order.status === 'pending' ? `<button class="btn btn-secondary btn-small" onclick="admin.fulfillOrder('${order.id}')">発注</button>` : ''}
            </td>
        `;
        return row;
    }

    getStatusName(status) {
        const statuses = {
            'pending': '未発送',
            'shipped': '発送済み',
            'delivered': '配送完了'
        };
        return statuses[status] || status;
    }

    loadPrintfulProducts() {
        const printfulProducts = document.getElementById('printful-products');
        printfulProducts.innerHTML = '<p>Printful商品を同期中...</p>';

        console.log('Printful商品同期開始...');
        
        // Printful APIから商品を取得
        this.fetchPrintfulProducts().then(products => {
            console.log('Printful商品取得成功:', products);
            this.printfulProducts = products;
            this.renderPrintfulProducts();
        }).catch(error => {
            console.error('Printful API Error:', error);
            printfulProducts.innerHTML = `<p>Printful商品の取得に失敗しました: ${error.message}</p><p>設定でAPIトークンを確認してください。</p>`;
        });
    }

    async fetchPrintfulProducts() {
        const token = localStorage.getItem('printful_token');
        console.log('保存されたトークン:', token ? 'あり' : 'なし');
        
        if (!token) {
            throw new Error('Printful token not found');
        }

        try {
            console.log('API呼び出し開始...');
            // CORS問題を回避するため、プロキシ経由でAPIを呼び出し
            const response = await fetch('./api/printful/variants.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            console.log('APIレスポンス:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API エラーレスポンス:', errorData);
                throw new Error(`API Error: ${errorData.message || response.status}`);
            }

            const data = await response.json();
            console.log('API データ取得成功:', data);
            return data.result || [];
        } catch (error) {
            console.error('Printful API Error:', error);
            throw new Error(`Printful API接続エラー: ${error.message}`);
        }
    }

    renderPrintfulProducts() {
        const printfulProducts = document.getElementById('printful-products');
        printfulProducts.innerHTML = '';

        if (this.printfulProducts.length === 0) {
            printfulProducts.innerHTML = '<p>Printful商品が見つかりませんでした。</p>';
            return;
        }

        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';

        this.printfulProducts.forEach(product => {
            const productCard = this.createPrintfulProductCard(product);
            productsGrid.appendChild(productCard);
        });

        printfulProducts.appendChild(productsGrid);
    }

    createPrintfulProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image || '/admin/images/placeholder.jpg'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">¥${product.price}</div>
                <div class="product-provider">Printful</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="admin.addPrintfulProduct('${product.id}')">商品に追加</button>
                </div>
            </div>
        `;
        return card;
    }

    showProductModal() {
        document.getElementById('product-modal').style.display = 'block';
        document.getElementById('product-form').reset();
        this.togglePrintfulVariant('printful');
    }

    hideProductModal() {
        document.getElementById('product-modal').style.display = 'none';
    }

    togglePrintfulVariant(provider) {
        const variantGroup = document.getElementById('printful-variant-group');
        if (provider === 'printful') {
            variantGroup.style.display = 'block';
        } else {
            variantGroup.style.display = 'none';
        }
    }

    handleProductSubmit() {
        const formData = new FormData(document.getElementById('product-form'));
        const product = {
            id: Date.now().toString(),
            title: formData.get('title'),
            price: parseInt(formData.get('price')),
            description: formData.get('description'),
            provider: formData.get('provider'),
            printful_variant: formData.get('printful_variant'),
            image: '/admin/images/placeholder.jpg', // 実際の実装では画像アップロード処理
            created_at: new Date().toISOString()
        };

        this.products.push(product);
        this.saveData();
        this.loadProducts();
        this.hideProductModal();
        this.updateDashboard();
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // モーダルに商品情報を設定
            document.getElementById('product-title').value = product.title;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-provider').value = product.provider;
            document.getElementById('printful-variant').value = product.printful_variant || '';
            
            this.togglePrintfulVariant(product.provider);
            this.showProductModal();
        }
    }

    deleteProduct(productId) {
        if (confirm('この商品を削除しますか？')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveData();
            this.loadProducts();
            this.updateDashboard();
        }
    }

    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`注文詳細:\n注文ID: ${order.id}\n顧客名: ${order.customer_name}\n商品: ${order.items.map(item => item.name).join(', ')}\n金額: ¥${order.total.toLocaleString()}\nステータス: ${this.getStatusName(order.status)}`);
        }
    }

    fulfillOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            // Printful APIで発注
            this.createPrintfulOrder(order).then(() => {
                order.status = 'shipped';
                this.saveData();
                this.loadOrders();
                this.updateDashboard();
                alert('Printfulに発注しました');
            }).catch(error => {
                alert('発注に失敗しました: ' + error.message);
            });
        }
    }

    async createPrintfulOrder(order) {
        const token = localStorage.getItem('printful_token');
        if (!token) {
            throw new Error('Printful token not found');
        }

        const printfulOrder = {
            external_id: order.id,
            recipient: {
                name: order.customer_name,
                address1: order.shipping_address.address1,
                city: order.shipping_address.city,
                zip: order.shipping_address.zip,
                country_code: order.shipping_address.country_code || 'JP'
            },
            items: order.items.map(item => ({
                variant_id: item.printful_variant_id,
                quantity: item.quantity
            })),
            confirm: true
        };

        try {
            const response = await fetch('./api/printful/orders.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    token,
                    order: printfulOrder 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.message || response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Printful Order API Error:', error);
            throw new Error(`Printful発注エラー: ${error.message}`);
        }
    }

    syncPrintfulProducts() {
        this.loadPrintfulProducts();
    }

    addPrintfulProduct(variantId) {
        const product = this.printfulProducts.find(p => p.id === variantId);
        if (product) {
            const newProduct = {
                id: Date.now().toString(),
                title: product.name,
                price: product.price,
                description: product.description || '',
                provider: 'printful',
                printful_variant: variantId,
                image: product.image || '/admin/images/placeholder.jpg',
                created_at: new Date().toISOString()
            };

            this.products.push(newProduct);
            this.saveData();
            this.loadProducts();
            this.updateDashboard();
            alert('商品を追加しました');
        }
    }

    savePrintfulToken() {
        const token = document.getElementById('printful-token').value;
        console.log('保存しようとしているトークン:', token ? '入力あり' : '入力なし');
        
        if (token) {
            localStorage.setItem('printful_token', token);
            console.log('トークン保存完了');
            alert('Printfulトークンを保存しました');
        } else {
            alert('トークンを入力してください');
        }
    }

    saveBaseSecret() {
        const secret = document.getElementById('base-webhook-secret').value;
        if (secret) {
            localStorage.setItem('base_webhook_secret', secret);
            alert('BASE Webhook Secretを保存しました');
        } else {
            alert('Secretを入力してください');
        }
    }

    filterOrders(status) {
        const orders = status === 'all' ? this.orders : this.orders.filter(order => order.status === status);
        const ordersTbody = document.getElementById('orders-tbody');
        ordersTbody.innerHTML = '';

        orders.forEach(order => {
            const row = this.createOrderRow(order);
            ordersTbody.appendChild(row);
        });
    }

    loadData() {
        // ローカルストレージからデータを読み込み
        const savedProducts = localStorage.getItem('admin_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        }

        const savedOrders = localStorage.getItem('admin_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            // サンプルデータ
            this.orders = [
                {
                    id: 'ORD-001',
                    customer_name: '田中太郎',
                    items: [{ name: 'BKTYS Tシャツ', quantity: 1 }],
                    total: 3000,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    shipping_address: {
                        address1: '東京都渋谷区',
                        city: '渋谷区',
                        zip: '150-0002',
                        country_code: 'JP'
                    }
                }
            ];
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('admin_products', JSON.stringify(this.products));
        localStorage.setItem('admin_orders', JSON.stringify(this.orders));
    }
}

// 管理システムを初期化
const admin = new AdminSystem();
