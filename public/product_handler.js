// URL ของ API
const API_BASE = 'http://localhost:3000';
// Path ไปหน้า Login (ใช้ / เพื่อเริ่มจากหน้าบ้านเสมอ)
const LOGIN_PAGE_PATH = '/login_register.html'; 

document.addEventListener('DOMContentLoaded', () => {
    // ... (ส่วนจัดการปุ่มเลือกไซส์ เหมือนเดิม) ...
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // 1. ตรวจสอบ Login
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                alert('กรุณาเข้าสู่ระบบก่อนเลือกซื้อสินค้า');
                window.location.href = LOGIN_PAGE_PATH; 
                return;
            }

            // 2. ตรวจสอบไซส์
            const selectedSizeBtn = document.querySelector('.size-btn.selected');
            let selectedSize = 'Free Size';

            if (sizeBtns.length > 0) {
                if (!selectedSizeBtn) {
                    alert('กรุณาเลือกไซส์ก่อน');
                    return; 
                }
                selectedSize = selectedSizeBtn.innerText;
            }

            // 3. เตรียมข้อมูล
            const productData = {
                userId: userId,
                productId: this.dataset.id,    
                quantity: 1,                   
                size: selectedSize,
                color: this.dataset.color || 'Standard'
            };

            // 4. ส่งข้อมูล
            addToCartAPI(productData, this.dataset.name);
        });
    }
    
    updateNavBadgeAPI();
});

async function addToCartAPI(data, productName) {
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            if(confirm(`เพิ่ม "${productName}" ลงตะกร้าเรียบร้อย!\nต้องการไปที่ตะกร้าสินค้าเลยหรือไม่?`)) {
                // [จุดสำคัญ] แก้ Path ให้เป็น Absolute Path (เริ่มด้วย /)
                // เพราะ cart.html อยู่ติดกับ main.html ในโฟลเดอร์ public
                window.location.href = '/cart.html'; 
            } else {
                updateNavBadgeAPI();
            }
        } else {
            alert('เกิดข้อผิดพลาด: ' + (result.error || result.message));
        }

    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
}

async function updateNavBadgeAPI() {
    const userId = localStorage.getItem('user_id');
    const badge = document.getElementById('nav-cart-count');
    
    if (!userId || !badge) return;

    try {
        const response = await fetch(`${API_BASE}/cart/${userId}`);
        if (response.ok) {
            const data = await response.json();
            const totalQty = data.count || 0;
            badge.textContent = totalQty;
            badge.style.display = totalQty > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error fetching cart badge:', error);
    }
}