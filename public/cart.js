// URL ของ API (Node.js)
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบว่าล็อกอินหรือยัง?
    const userId = localStorage.getItem('user_id');
    const container = document.getElementById('cart-items-container');

    if (!userId) {
        // ถ้ายังไม่ล็อกอิน ให้แสดงข้อความแจ้งเตือน
        if(container) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px; color:#666;">
                    <i class="fas fa-user-lock" style="font-size:48px; margin-bottom:20px;"></i>
                    <h3>กรุณาเข้าสู่ระบบ</h3>
                    <p>เพื่อดูสินค้าในตะกร้าของคุณ</p>
                    <a href="../../login_register.html" style="color:black; text-decoration:underline; font-weight:bold;">ไปหน้าเข้าสู่ระบบ</a>
                </div>`;
        }
        updateTotals(0);
        updateHeaderCount(0);
        return;
    }

    // 2. ถ้าล็อกอินแล้ว ให้ดึงข้อมูลจาก Server (MySQL)
    loadCartFromAPI(userId);
});

// --- ฟังก์ชันดึงข้อมูลตะกร้าจาก API ---
async function loadCartFromAPI(userId) {
    const container = document.getElementById('cart-items-container');
    
    // แสดง Loading State
    if(container) container.innerHTML = `<p style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดตะกร้า...</p>`;

    try {
        // ยิง GET Request ไปที่ /cart/:userId
        const response = await fetch(`${API_BASE}/cart/${userId}`);
        
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();

        // เช็คว่ามีรายการสินค้าไหม
        if (data.items && data.items.length > 0) {
            renderCartItems(data.items); // แสดงรายการสินค้า
            updateTotals(data.total);    // แสดงยอดเงินรวม
            updateHeaderCount(data.count); // แสดงจำนวนชิ้น
        } else {
            showEmptyCart(); // แสดงตะกร้าว่าง
        }

    } catch (error) {
        console.error('Error loading cart:', error);
        if(container) container.innerHTML = `<p style="color:red; text-align:center; padding:30px;">
            <i class="fas fa-times-circle"></i> ไม่สามารถเชื่อมต่อกับ Server ได้<br>
            <small>โปรดตรวจสอบ Node.js Server และ Route /cart</small>
        </p>`;
    }
}

// --- ฟังก์ชันแสดงผล HTML ---
function renderCartItems(items) {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    container.innerHTML = ''; // ล้างของเก่า

    items.forEach((item) => {
        // สร้าง HTML สำหรับแต่ละสินค้า
        // หมายเหตุ: ชื่อตัวแปร item.xxx ต้องตรงกับที่ Backend ส่งมา (ดูใน routes/cart.js)
        
        // แก้ไข path รูปภาพให้ถูกต้อง (ถ้าไม่ได้เป็น URL เต็ม ให้เติม ../../)
        let imageSrc = item.image;
        if (imageSrc && !imageSrc.startsWith('http') && !imageSrc.startsWith('../')) {
             // สมมติรูปเก็บใน public/ ดังนั้นถอย 2 ชั้นจาก public/cart/
             imageSrc = '../../' + imageSrc; 
        }

        const html = `
        <div class="cart-item">
            <img src="${imageSrc || 'https://via.placeholder.com/150'}" 
                 class="item-image" 
                 onerror="this.src='https://via.placeholder.com/150'">
            
            <div class="item-details">
                <h3 class="item-name">${item.product_name}</h3>
                <p class="item-meta">
                    Size: <strong>${item.size || '-'}</strong> | Color: ${item.color || '-'}
                </p>
                <p class="item-price">฿${parseFloat(item.price).toLocaleString()}</p>
                
                <div class="quantity-control">
                    <!-- ปุ่มลบจำนวน -->
                    <button class="qty-btn" onclick="updateQtyAPI(${item.item_id}, ${item.quantity - 1})">-</button>
                    
                    <input type="text" value="${item.quantity}" class="qty-input" readonly>
                    
                    <!-- ปุ่มเพิ่มจำนวน -->
                    <button class="qty-btn" onclick="updateQtyAPI(${item.item_id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            
            <!-- ปุ่มลบสินค้า -->
            <button class="remove-btn" onclick="removeItemAPI(${item.item_id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        `;
        container.innerHTML += html;
    });
}

// --- ฟังก์ชันอัปเดตจำนวน (ยิงไปหา Server) ---
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

// --- ฟังก์ชันลบสินค้า (ยิงไปหา Server) ---
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

// --- ฟังก์ชันแสดงหน้าตะกร้าว่าง ---
function showEmptyCart() {
    const container = document.getElementById('cart-items-container');
    if (container) {
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
}

// --- ฟังก์ชันอัปเดตตัวเลขราคา (UI) ---
function updateTotals(total) {
    const formattedTotal = '฿' + parseFloat(total).toLocaleString('en-US', {minimumFractionDigits: 2});
    
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');

    if(subtotalEl) subtotalEl.innerText = formattedTotal;
    if(grandTotalEl) grandTotalEl.innerText = formattedTotal;
}

// --- ฟังก์ชันอัปเดตจำนวนสินค้า (UI) ---
function updateHeaderCount(count) {
    const headerCount = document.getElementById('header-cart-count');
    if(headerCount) headerCount.innerText = count + " ITEMS";
    
    // อัปเดตจุดแดงที่ Navbar ด้วย (ถ้ามี)
    const navBadge = document.getElementById('nav-cart-count');
    if(navBadge) {
        navBadge.innerText = count;
        navBadge.style.display = count > 0 ? 'block' : 'none';
    }
}