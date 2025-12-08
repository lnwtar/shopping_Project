document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();
});

// 1. โหลดสรุปรายการสินค้า
function loadCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const container = document.getElementById('checkout-items');
    
    if (cart.length === 0) {
        container.innerHTML = '<p>ไม่มีสินค้าในตะกร้า</p>';
        return;
    }

    let subtotal = 0;
    container.innerHTML = '';

    cart.forEach(item => {
        subtotal += item.price * item.qty;
        container.innerHTML += `
            <div class="summary-item">
                <span>${item.name} (x${item.qty})</span>
                <span>฿${(item.price * item.qty).toLocaleString()}</span>
            </div>
        `;
    });

    document.getElementById('summary-subtotal').innerText = '฿' + subtotal.toLocaleString();
    document.getElementById('summary-total').innerText = '฿' + subtotal.toLocaleString();
}

// 2. เลือกวิธีการชำระเงิน UI
function selectPayment(element) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

// 3. ฟังก์ชันสั่งซื้อ (แก้ไขการ Redirect)
async function placeOrder() {
    // --- A. ดึงค่า ---
    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const province = document.getElementById('province').value;
    const zipcode = document.getElementById('zipcode').value.trim();
    const paymentOption = document.querySelector('input[name="payment"]:checked');
    
    // --- B. ตรวจสอบ ---
    if (!fname || !lname || !phone || !address || !zipcode) {
        alert("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน");
        return;
    }
    if (!paymentOption) {
        alert("กรุณาเลือกวิธีการชำระเงิน");
        return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        return;
    }

    const cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fullName = `${fname} ${lname}`;
    const fullAddress = `${address} จ.${province} ${zipcode}`;

    const orderData = {
        userId: userId,
        items: cart,
        total: total,
        shipping_name: fullName,
        shipping_address: fullAddress,
        shipping_phone: phone,
        payment_method: paymentOption.value
    };

    // --- C. ส่งข้อมูล ---
    try {
        const response = await fetch('http://localhost:3000/orders/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            // [จุดที่แก้ไข]: เมื่อสำเร็จ ให้ไปหน้า order_success พร้อมเลข Order ID
            // alert('สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ'); // (เอาออกก็ได้)
            
            localStorage.removeItem('myCart'); // ล้างตะกร้า
            
            // ใช้ orderId ที่ Backend ส่งกลับมา
            const orderId = result.orderId; 
            window.location.href = `order_success.html?orderId=${orderId}`; 
            
        } else {
            alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
}