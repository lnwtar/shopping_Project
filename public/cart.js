document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
});

// ฟังก์ชันโหลดข้อมูลจาก LocalStorage มาแสดงผล
function loadCartItems() {
    const container = document.getElementById('cart-items-container');
    
    // 1. ดึงข้อมูลจากกล่องที่ชื่อ 'myCart' (ต้องชื่อเดียวกับใน product_handler.js)
    const cart = JSON.parse(localStorage.getItem('myCart')) || [];

    // 2. ถ้าตะกร้าว่าง
    if (cart.length === 0) {
        if(container) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px; color:#666;">
                    <i class="fas fa-shopping-basket" style="font-size:48px; margin-bottom:20px;"></i>
                    <h3>ตะกร้าสินค้าว่างเปล่า</h3>
                    <p>ยังไม่มีสินค้าในตะกร้าของคุณ</p>
                    <a href="../../main.html" style="text-decoration:underline; font-weight:bold;">กลับไปเลือกซื้อสินค้า</a>
                </div>`;
        }
        updateTotals(0);
        updateHeaderCount(0);
        return;
    }

    // 3. ถ้ามีสินค้า ให้สร้าง HTML
    if(container) {
        container.innerHTML = ''; // เคลียร์ของเก่า
        
        cart.forEach((product, index) => {
            const html = `
            <div class="cart-item">
                <img src="${product.image}" onerror="this.src='https://via.placeholder.com/150'" class="item-image">
                <div class="item-details">
                    <h3 class="item-name">${product.name}</h3>
                    <p class="item-meta">
                        Size: <strong>${product.size}</strong> | Color: ${product.color}
                    </p>
                    <p class="item-price">฿${product.price.toLocaleString()}</p>
                    
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
                        <input type="text" value="${product.qty}" class="qty-input" readonly>
                        <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeCartItem(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            `;
            container.innerHTML += html;
        });
    }

    // 4. คำนวณยอดเงินรวม
    calculateTotal(cart);
}

// ฟังก์ชันเพิ่ม/ลดจำนวน
window.updateCartQty = function(index, change) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    // เปลี่ยนจำนวน
    cart[index].qty += change;
    
    // ห้ามต่ำกว่า 1
    if (cart[index].qty < 1) cart[index].qty = 1;
    
    // บันทึกทับลงเครื่อง
    localStorage.setItem('myCart', JSON.stringify(cart));
    
    // โหลดหน้าจอใหม่เพื่อให้ตัวเลขเปลี่ยน
    loadCartItems();
};

// ฟังก์ชันลบสินค้า
window.removeCartItem = function(index) {
    if(confirm('ต้องการลบสินค้านี้ออกจากตะกร้า?')) {
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        cart.splice(index, 1); // ลบตัวที่ index นั้น
        localStorage.setItem('myCart', JSON.stringify(cart));
        loadCartItems();
    }
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

// อัปเดตตัวเลขราคา
function updateTotals(total) {
    const formatted = '฿' + total.toLocaleString('en-US', {minimumFractionDigits: 2});
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');
    
    if(subtotalEl) subtotalEl.innerText = formatted;
    if(grandTotalEl) grandTotalEl.innerText = formatted;
}

// อัปเดตจำนวนสินค้าตรงหัวข้อ และ Navbar
function updateHeaderCount(count) {
    const headerCount = document.getElementById('header-cart-count');
    if(headerCount) headerCount.innerText = count + " ITEMS";
    
    const navBadge = document.getElementById('nav-cart-count');
    if(navBadge) {
        navBadge.innerText = count;
        navBadge.style.display = count > 0 ? 'block' : 'none';
    }
}