// URL ของ API (Node.js)
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. เช็คว่าล็อกอินหรือยัง
    const userId = localStorage.getItem('user_id');
    const container = document.getElementById('cart-items-container');

    if (!userId) {
        if(container) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <p>กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้าของคุณ</p>
                    <a href="../../login_register.html" style="color:blue; text-decoration:underline;">ไปหน้าเข้าสู่ระบบ</a>
                </div>`;
        }
        return;
    }

    // 2. ถ้าล็อกอินแล้ว ให้ดึงข้อมูลจาก Server
    loadCartFromAPI(userId);
});

// ฟังก์ชันดึงข้อมูลจาก API
async function loadCartFromAPI(userId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${userId}`);
        const data = await response.json();

        // เช็คว่ามีรายการสินค้าไหม
        if (data.items && data.items.length > 0) {
            renderCartItems(data.items);
            updateSummary(data.total, data.count);
        } else {
            showEmptyCart();
        }

    } catch (error) {
        console.error('Error loading cart:', error);
        alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
}

// ฟังก์ชันแสดงผล HTML
function renderCartItems(items) {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = ''; // เคลียร์ของเก่า

    items.forEach((item, index) => {
        // คำนวณราคารวมต่อชิ้น
        const lineTotal = item.price * item.quantity;

        const html = `
        <div class="cart-item" data-id="${item.item_id}">
            <!-- รูปภาพ (ถ้าไม่มีรูปใส่ Placeholder) -->
            <img src="${item.image || 'https://via.placeholder.com/150'}" class="item-image" onerror="this.src='https://via.placeholder.com/150'">
            
            <div class="item-details">
                <h3 class="item-name">${item.product_name}</h3>
                <p class="item-meta">
                    Size: <strong>${item.size || 'Free'}</strong> | Color: ${item.color || 'Standard'}
                </p>
                <p class="item-price">฿${parseFloat(item.price).toLocaleString()}</p>
                
                <div class="quantity-control">
                    <button class="qty-btn" onclick="updateQtyAPI(${item.item_id}, ${item.quantity - 1})">-</button>
                    <input type="text" value="${item.quantity}" class="qty-input" readonly>
                    <button class="qty-btn" onclick="updateQtyAPI(${item.item_id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            
            <button class="remove-btn" onclick="removeItemAPI(${item.item_id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        `;
        container.innerHTML += html;
    });
}

// ฟังก์ชันอัปเดตจำนวน (ยิงไปหา Server)
window.updateQtyAPI = async function(itemId, newQty) {
    if (newQty < 1) return; // ห้ามต่ำกว่า 1

    try {
        await fetch(`${API_BASE}/cart/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: itemId, quantity: newQty })
        });
        
        // โหลดข้อมูลใหม่หลังจากอัปเดต
        const userId = localStorage.getItem('user_id');
        loadCartFromAPI(userId);

    } catch (error) {
        console.error('Update error:', error);
    }
};

// ฟังก์ชันลบสินค้า (ยิงไปหา Server)
window.removeItemAPI = async function(itemId) {
    if(!confirm('ต้องการลบสินค้านี้ใช่ไหม?')) return;

    try {
        await fetch(`${API_BASE}/cart/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: itemId })
        });

        // โหลดข้อมูลใหม่
        const userId = localStorage.getItem('user_id');
        loadCartFromAPI(userId);

    } catch (error) {
        console.error('Remove error:', error);
    }
};

// ฟังก์ชันแสดงหน้าตะกร้าว่าง
function showEmptyCart() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = `
        <div style="text-align:center; padding:50px; color:#666;">
            <i class="fas fa-shopping-basket" style="font-size:48px; margin-bottom:20px;"></i>
            <h3>ตะกร้าสินค้าว่างเปล่า</h3>
            <p>ยังไม่มีสินค้าในตะกร้าของคุณ</p>
            <a href="../../main.html" style="text-decoration:underline; font-weight:bold;">กลับไปเลือกซื้อสินค้า</a>
        </div>`;
    updateSummary(0, 0);
}

// ฟังก์ชันอัปเดตตัวเลขสรุป (ราคาและจำนวน)
function updateSummary(total, count) {
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');
    const headerCount = document.getElementById('header-cart-count');
    const navBadge = document.getElementById('nav-cart-count');

    const formattedTotal = '฿' + parseFloat(total).toLocaleString();

    if(subtotalEl) subtotalEl.innerText = formattedTotal;
    if(grandTotalEl) grandTotalEl.innerText = formattedTotal;
    if(headerCount) headerCount.innerText = count + " ITEMS";
    
    // อัปเดตจุดแดงที่ Navbar (ถ้ามี)
    if(navBadge) {
        navBadge.innerText = count;
        navBadge.style.display = count > 0 ? 'block' : 'none';
    }
}