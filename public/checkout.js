const API_BASE = 'http://localhost:3000';
let currentCartItems = []; // ตัวแปรเก็บสินค้าชั่วคราว เพื่อเตรียมส่งกลับไปบันทึกออเดอร์

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoad();
});

// 1. ตรวจสอบ Login และโหลดข้อมูล
function checkAuthAndLoad() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
        window.location.href = '../../login_register.html';
        return;
    }
    
    // โหลดข้อมูลสินค้าจาก Server (MySQL)
    loadCheckoutFromAPI(userId);
    // เติมที่อยู่เดิม (ถ้ามี)
    autofillShippingInfo();
}

// 2. ดึงข้อมูลตะกร้าจาก API
async function loadCheckoutFromAPI(userId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${userId}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            currentCartItems = data.items; // เก็บใส่ตัวแปรไว้ใช้ตอนกดสั่งซื้อ
            renderCheckoutItems(data.items);
            updateSummary(data.total, data.count);
        } else {
            // ถ้าตะกร้าใน Database ว่างเปล่า
            document.getElementById('checkout-items').innerHTML = '<p class="text-center">ไม่มีสินค้าในตะกร้า</p>';
            alert("ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อน");
            window.location.href = '../../main.html';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('checkout-items').innerHTML = '<p style="color:red">โหลดข้อมูลไม่สำเร็จ</p>';
    }
}

// 3. แสดงรายการสินค้า (Render)
function renderCheckoutItems(items) {
    const container = document.getElementById('checkout-items');
    container.innerHTML = '';

    items.forEach(item => {
        // คำนวณราคารวมต่อชิ้น
        const lineTotal = item.price * item.quantity;
        
        const html = `
            <div class="summary-item">
                <div style="flex-grow:1;">
                    <span style="font-weight:600;">${item.product_name}</span>
                    <div style="font-size:0.85rem; color:#666;">
                        Size: ${item.size || '-'}, Color: ${item.color || '-'} (x${item.quantity})
                    </div>
                </div>
                <span style="font-weight:bold;">฿${lineTotal.toLocaleString()}</span>
            </div>
        `;
        container.innerHTML += html;
    });
}

function updateSummary(total, count) {
    document.getElementById('summary-subtotal').innerText = '฿' + total.toLocaleString();
    document.getElementById('summary-total').innerText = '฿' + total.toLocaleString();
}

// ฟังก์ชันเลือกวิธีชำระเงิน
window.selectPayment = function(element) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

// 4. ฟังก์ชันสั่งซื้อ (Place Order)
window.placeOrder = async function() {
    // --- A. ดึงข้อมูลจากฟอร์ม ---
    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const province = document.getElementById('province').value;
    const zipcode = document.getElementById('zipcode').value.trim();
    const paymentOption = document.querySelector('input[name="payment"]:checked');
    const userId = localStorage.getItem('user_id');

    // --- B. Validation ---
    if (!userId) { alert("Session หมดอายุ กรุณาล็อกอินใหม่"); window.location.href = '../../login_register.html'; return; }
    if (!fname || !lname || !phone || !address || !zipcode) { alert("กรุณากรอกที่อยู่ให้ครบถ้วน"); return; }
    if (!paymentOption) { alert("กรุณาเลือกวิธีการชำระเงิน"); return; }
    if (currentCartItems.length === 0) { alert("ข้อมูลสินค้าผิดพลาด กรุณาลองใหม่"); return; }

    const fullName = `${fname} ${lname}`;
    const fullAddress = `${address} จ.${province} ${zipcode}`;

    // --- C. เตรียมข้อมูล (Mapping ให้ตรงกับที่ Backend ต้องการ) ---
    // Backend (routes/orders.js) ต้องการ: userId, items, total, ...
    // โดย items แต่ละตัวต้องมี: id, name, price, qty
    
    const mappedItems = currentCartItems.map(item => ({
        id: item.product_id,      // Map จาก product_id ไปเป็น id
        name: item.product_name,  // Map จาก product_name ไปเป็น name
        price: parseFloat(item.price),
        qty: item.quantity,       // Map จาก quantity ไปเป็น qty
        seller_id: 1              // (สมมติ default หรือถ้า API ส่งมาก็ใช้ item.seller_id)
    }));

    // คำนวณ Total อีกครั้งจากข้อมูลที่มี
    const totalAmount = mappedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const orderData = {
        userId: userId,
        items: mappedItems, // ส่งรายการที่แปลงแล้ว
        total: totalAmount,
        shipping_name: fullName,
        shipping_address: fullAddress,
        shipping_phone: phone,
        payment_method: paymentOption.value
    };

    // บันทึกที่อยู่ล่าสุดไว้ใช้ครั้งหน้า
    localStorage.setItem('last_shipping_info', JSON.stringify({
        shipping_name: fullName, shipping_phone: phone, shipping_address_detail: address, shipping_province: province, shipping_zipcode: zipcode
    }));

    // --- D. ยิง API ---
    try {
        const response = await fetch(`${API_BASE}/orders/place`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            // สำเร็จ! ไปหน้า Success
            // (Database เคลียร์ตะกร้าให้แล้ว หรือ Backend จัดการให้)
            window.location.href = `order_success.html?orderId=${result.orderId}`;
        } else {
            alert('เกิดข้อผิดพลาด: ' + (result.error || result.message));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
}

// ฟังก์ชันเติมข้อมูลเก่า
function autofillShippingInfo() {
    const lastInfo = localStorage.getItem('last_shipping_info');
    if (lastInfo) {
        try {
            const info = JSON.parse(lastInfo);
            if(document.getElementById('phone')) document.getElementById('phone').value = info.shipping_phone || '';
            if(document.getElementById('address')) document.getElementById('address').value = info.shipping_address_detail || '';
            if(document.getElementById('zipcode')) document.getElementById('zipcode').value = info.shipping_zipcode || '';
            if(info.shipping_name) {
                const parts = info.shipping_name.split(' ');
                document.getElementById('fname').value = parts[0] || '';
                document.getElementById('lname').value = parts.slice(1).join(' ') || '';
            }
            const provinceEl = document.getElementById('province');
            if (provinceEl && info.shipping_province) provinceEl.value = info.shipping_province;
        } catch (e) { }
    }
}