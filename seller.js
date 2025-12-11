const API_URL = 'http://localhost:3000'; 
const userSession = localStorage.getItem('user_session');

// 1. ตรวจสอบสิทธิ์ทันทีที่โหลด
// (หมายเหตุ: ตอนนี้เราเปิดให้ทุกคนเป็นคนขายได้ แต่ยังต้องล็อกอินก่อน)
if (!userSession) {
    alert('กรุณาเข้าสู่ระบบก่อน');
    window.location.href = 'login_register.html';
} 

const user = JSON.parse(userSession); // Get user object

document.addEventListener('DOMContentLoaded', () => {
    // แสดงชื่อผู้ใช้
    const sellerNameEl = document.getElementById('seller-name');
    if(sellerNameEl) sellerNameEl.innerText = user.username;

    // โหลดข้อมูลเริ่มต้น
    loadOrders();
    loadMyProducts();

    // Event Listeners
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('refresh-orders').addEventListener('click', loadOrders);
    document.getElementById('logout-link').addEventListener('click', handleLogout);
});

// 2. ฟังก์ชันลงสินค้า
async function handleAddProduct(e) {
    e.preventDefault();
    
    const productData = {
        seller_id: user.id,
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        stock: document.getElementById('p-stock').value,
        image: document.getElementById('p-image').value,
        description: document.getElementById('p-desc').value
    };

    try {
        const res = await fetch(`${API_URL}/seller/product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const result = await res.json();
        
        if (res.ok) {
            alert(`ลงสินค้าสำเร็จ! (ID: ${result.productId})`);
            loadMyProducts(); // รีโหลดรายการ
            document.getElementById('addProductForm').reset();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        alert('เชื่อมต่อ Server ไม่ได้');
    }
}

// 3. ฟังก์ชันโหลดออเดอร์ (Incoming Orders)
async function loadOrders() {
    try {
        const res = await fetch(`${API_URL}/seller/orders/${user.id}`);
        const orders = await res.json();
        
        const tbody = document.getElementById('ordersBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">ยังไม่มีคำสั่งซื้อเข้ามา</td></tr>';
            return;
        }

        orders.forEach(o => {
            let statusClass = o.order_status === 'paid' ? 'status-paid' : 'status-pending';
            const date = new Date(o.created_at).toLocaleDateString('th-TH');

            const row = `
                <tr>
                    <td>#${o.order_id}<br><small style="color:#888;">${date}</small></td>
                    <td>
                        <b>${o.product_name}</b><br>
                        <small>x${o.quantity}</small>
                    </td>
                    <td>
                        ${o.shipping_name || o.buyer_name}<br>
                        <small style="color:#666;">${o.shipping_address || '-'}</small>
                    </td>
                    <td style="font-weight:bold;">฿${parseFloat(o.line_total).toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${o.order_status}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error(err);
    }
}

// 4. ฟังก์ชันโหลดสินค้าของฉัน
async function loadMyProducts() {
    try {
        const res = await fetch(`${API_URL}/seller/products/${user.id}`);
        const products = await res.json();
        const container = document.getElementById('myProductsList');
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">คุณยังไม่มีสินค้า</p>';
            return;
        }

        let html = '<ul style="list-style:none; padding:0;">';
        products.forEach(p => {
            // Path รูป
            let imgPath = p.image;
            if(imgPath && !imgPath.startsWith('http')) imgPath = 'public/' + imgPath; 

            html += `<li style="padding:15px; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${imgPath}" class="product-thumb" onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <div style="font-weight:600; font-size:0.95rem;">${p.name}</div>
                        <div style="font-size:0.8rem; color:#888;">Stock: ${p.stock} | ID: ${p.id}</div>
                    </div>
                </div>
                <span style="font-weight:bold;">฿${parseFloat(p.price).toLocaleString()}</span>
            </li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    } catch (err) { console.error(err); }
}

function handleLogout() {
    if(confirm('ต้องการออกจากระบบ?')) {
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_id');
        window.location.href = 'login_register.html';
    }
}