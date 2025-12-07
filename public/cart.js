// --- โหลดข้อมูลเมื่อเข้าหน้าเว็บ ---
document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
});

// ฟังก์ชันโหลดสินค้าจาก LocalStorage มาแสดง
function loadCartItems() {
    const container = document.getElementById('cart-items-container');
    const cart = JSON.parse(localStorage.getItem('myCart')) || []; // ดึงข้อมูล

    // ถ้าตะกร้าว่าง
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#777;"><i class="fas fa-shopping-basket" style="font-size:48px; margin-bottom:15px;"></i><p>Your cart is empty.</p><a href="main.html" style="text-decoration:underline;">Continue Shopping</a></div>';
        updateTotals(0);
        updateHeaderCount(0);
        return;
    }

    container.innerHTML = ''; // เคลียร์ของเก่า

    // วนลูปสร้าง HTML สำหรับแต่ละสินค้า
    cart.forEach((product, index) => {
        const html = `
        <div class="cart-item">
            <img src="${product.image}" onerror="this.src='https://via.placeholder.com/120x150?text=No+Image'" alt="${product.name}" class="item-image">
            <div class="item-details">
                <h3 class="item-name">${product.name}</h3>
                <p class="item-meta">Size: ${product.size} | Color: ${product.color}</p>
                <p class="item-price">฿${product.price.toLocaleString()}</p>
                
                <div class="quantity-control">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <input type="text" value="${product.qty}" class="qty-input" readonly>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeProduct(${index})"><i class="fas fa-times"></i></button>
        </div>
        `;
        container.innerHTML += html;
    });

    calculateTotal(cart);
}

// ฟังก์ชันเปลี่ยนจำนวน (เชื่อมกับ LocalStorage)
window.changeQty = function(index, change) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    cart[index].qty += change;
    
    if (cart[index].qty < 1) cart[index].qty = 1; // ห้ามต่ำกว่า 1
    
    localStorage.setItem('myCart', JSON.stringify(cart)); // บันทึกทับ
    loadCartItems(); // โหลดหน้าใหม่
};

// ฟังก์ชันลบสินค้า
window.removeProduct = function(index) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    cart.splice(index, 1); // ลบตัวที่ index นั้น
    
    localStorage.setItem('myCart', JSON.stringify(cart));
    loadCartItems();
};

// ฟังก์ชันคำนวณเงิน
function calculateTotal(cart) {
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        itemCount += item.qty;
    });

    updateTotals(total);
    updateHeaderCount(itemCount);
}

function updateTotals(total) {
    const formatted = '฿' + total.toLocaleString('en-US', {minimumFractionDigits: 2});
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');
    
    if(subtotalEl) subtotalEl.textContent = formatted;
    if(grandTotalEl) grandTotalEl.textContent = formatted;
}

function updateHeaderCount(count) {
    const headerCount = document.getElementById('header-cart-count');
    if(headerCount) headerCount.textContent = count + " ITEMS";
    
    // อัปเดตจุดแดงตรงเมนูบาร์ (ถ้ามี)
    const navBadge = document.getElementById('nav-cart-count');
    if(navBadge) {
        navBadge.textContent = count;
        navBadge.style.display = count > 0 ? 'block' : 'none';
    }
}