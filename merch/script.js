const PAYSTACK_PUBLIC_KEY = 'pk_live_456727d7f162697c9ef02ca3795fc4b0576ecb9e';
let cart = [];

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCart();
    showCartDrawer();
}

function removeFromCart(name) {
    cart = cart.filter(i => i.name !== name);
    updateCart();
}

function updateQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(name);
    else updateCart();
}

function updateCart() {
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const count = cart.reduce((sum, i) => sum + i.qty, 0);

    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartTotal').textContent = '₦' + total.toLocaleString();

    const itemsEl = document.getElementById('cartItems');
    if (cart.length === 0) {
        itemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        itemsEl.innerHTML = cart.map(i => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${i.name}</span>
                    <span class="cart-item-price">₦${(i.price * i.qty).toLocaleString()}</span>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQty('${i.name}', -1)">−</button>
                    <span>${i.qty}</span>
                    <button onclick="updateQty('${i.name}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${i.name}')">🗑</button>
                </div>
            </div>
        `).join('');
    }
}

function showCartDrawer() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
}

function openCheckout() {
    if (cart.length === 0) return showCartDrawer();
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById('orderTotal').textContent = '₦' + total.toLocaleString();
    document.getElementById('orderSummaryItems').innerHTML = cart.map(i =>
        `<div class="summary-line"><span>${i.name} × ${i.qty}</span><span>₦${(i.price * i.qty).toLocaleString()}</span></div>`
    ).join('');
    document.getElementById('checkoutOverlay').classList.add('open');
    toggleCart();
}

function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('open');
}

function initiatePayment(e) {
    e.preventDefault();
    const email = document.getElementById('custEmail').value;
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: total * 100,
        currency: 'NGN',
        ref: 'BOBL_MERCH_' + Date.now(),
        metadata: {
            custom_fields: [
                { display_name: 'Name', variable_name: 'name', value: name },
                { display_name: 'Phone', variable_name: 'phone', value: phone },
                { display_name: 'Address', variable_name: 'address', value: address },
                { display_name: 'Items', variable_name: 'items', value: cart.map(i => `${i.name} x${i.qty}`).join(', ') }
            ]
        },
        onSuccess: function(response) {
            fetch('https://api.webobl.com/v1.0/merch/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: response.reference,
                    name: document.getElementById('custName').value,
                    email: document.getElementById('custEmail').value,
                    phone: document.getElementById('custPhone').value,
                    address: document.getElementById('custAddress').value,
                    items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
                    total: cart.reduce((sum, i) => sum + i.price * i.qty, 0)
                })
            }).catch(() => {});
            gtag('event', 'purchase', {
                transaction_id: response.reference,
                value: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
                currency: 'NGN',
                items: cart.map(i => ({ item_name: i.name, price: i.price, quantity: i.qty }))
            });
            closeCheckout();
            cart = [];
            updateCart();
            showToast('✅ Payment successful! Thank you for supporting Bobl!');
        },
        onClose: function() {}
    });
    handler.openIframe();
}

updateCart();


function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 4000);
}