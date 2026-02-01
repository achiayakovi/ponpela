/**
 * Ponpela Shop Integration
 * משיכת והצגת מוצרים מ-WooCommerce
 */

const SHOP_API = 'https://shop.ponpela.co.il/wp-json/ponpela/v1/products';

// משתני גלובליים
let cart = [];
let products = [];

/**
 * משיכת כל המוצרים
 */
async function fetchProducts() {
    try {
        console.log('Fetching products from:', SHOP_API);
        const response = await fetch(SHOP_API);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        products = await response.json();
        console.log('Products received:', products);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * משיכת מוצר בודד
 */
async function fetchProduct(productId) {
    try {
        const response = await fetch(`${SHOP_API}/product/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

/**
 * הצגת מוצרים בעמוד
 */
function displayProducts(productsToDisplay = products) {
    const container = document.getElementById('products-container');
    if (!container) {
        console.error('Products container not found!');
        return;
    }
    
    console.log('Displaying products in container:', productsToDisplay);
    container.innerHTML = '';
    
    if (!productsToDisplay || productsToDisplay.length === 0) {
        container.innerHTML = '<p class="no-products">אין מוצרים זמינים כרגע</p>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        console.log('Creating card for product:', product.name);
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    console.log('Total product cards added:', productsToDisplay.length);
}

/**
 * יצירת כרטיס מוצר
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image-wrapper">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.name}" class="product-image">` :
                `<div class="product-no-image">אין תמונה</div>`
            }
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            ${product.short_description ? 
                `<p class="product-short-desc">${product.short_description}</p>` : 
                ''
            }
            <div class="product-footer">
                <span class="product-price">${formatPrice(product.price)}</span>
                <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                    הוסף לסל
                </button>
            </div>
        </div>
    `;
    
    // לחיצה על הכרטיס פותחת עמוד מוצר
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-add-to-cart')) {
            showProductDetails(product.id);
        }
    });
    
    return card;
}

/**
 * הוספה לסל
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
            image: product.image
        });
    }
    
    updateCart();
    showNotification(`${product.name} נוסף לסל!`);
}

/**
 * הסרה מהסל
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

/**
 * עדכון כמות בסל
 */
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (quantity <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = quantity;
        updateCart();
    }
}

/**
 * עדכון תצוגת הסל
 */
function updateCart() {
    // עדכון badge של כמות פריטים
    const cartBadge = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    
    // שמירה ב-localStorage
    localStorage.setItem('ponpela_cart', JSON.stringify(cart));
    
    // עדכון תצוגת הסל אם הוא פתוח
    if (document.getElementById('cart-modal')) {
        displayCart();
    }
}

/**
 * הצגת הסל
 */
function displayCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">הסל ריק</p>';
        cartTotal.textContent = formatPrice(0);
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || '/logo.png'}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <button class="btn-remove" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total);
}

/**
 * פתיחת חלון הסל
 */
function openCart() {
    let modal = document.getElementById('cart-modal');
    if (!modal) {
        modal = createCartModal();
        document.body.appendChild(modal);
    }
    displayCart();
    modal.style.display = 'flex';
}

/**
 * סגירת חלון הסל
 */
function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * יצירת חלון הסל
 */
function createCartModal() {
    const modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>סל קניות</h2>
                <button class="btn-close" onclick="closeCart()">×</button>
            </div>
            <div id="cart-items" class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total-row">
                    <span>סה"כ:</span>
                    <span id="cart-total" class="cart-total">₪0</span>
                </div>
                <button class="btn-checkout" onclick="proceedToCheckout()">המשך לתשלום</button>
            </div>
        </div>
    `;
    return modal;
}

/**
 * המשך לתשלום
 */
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('הסל ריק!');
        return;
    }
    
    // כאן תהיה הפניה לעמוד תשלום
    window.location.href = '/checkout.html';
}

/**
 * הצגת פרטי מוצר
 */
async function showProductDetails(productId) {
    const product = await fetchProduct(productId);
    if (!product) return;
    
    // כאן תוכל להוסיף modal עם פרטי מוצר מלאים
    console.log('Product details:', product);
}

/**
 * הודעת התראה
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * עיצוב מחיר
 */
function formatPrice(price) {
    return `₪${parseFloat(price).toFixed(2)}`;
}

/**
 * טעינת הסל מ-localStorage
 */
function loadCart() {
    const savedCart = localStorage.getItem('ponpela_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

/**
 * אתחול
 */
async function initShop() {
    console.log('Initializing shop...');
    loadCart();
    const productsData = await fetchProducts();
    console.log('Products fetched:', productsData);
    console.log('Number of products:', productsData.length);
    displayProducts(productsData);
    console.log('Products displayed');
}

// טעינה אוטומטית כשהדף נטען
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShop);
} else {
    initShop();
}
