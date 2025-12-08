document.addEventListener('DOMContentLoaded', () => {
    
    // --- ส่วนที่ 1: ระบบเลือกไซส์ (ถ้ามีปุ่มให้เลือก) ---
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // ล้างการเลือกเก่า
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            // เลือกปุ่มใหม่
            this.classList.add('selected');
        });
    });

    // --- ส่วนที่ 2: เมื่อกดปุ่ม Add to Bag ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            
            // 1. ตรวจสอบว่าเลือกไซส์หรือยัง (ถ้าสินค้ามีให้เลือกไซส์)
            const selectedSizeBtn = document.querySelector('.size-btn.selected');
            let selectedSize = 'Free Size'; // ค่าเริ่มต้นถ้าไม่มีปุ่มให้เลือก

            if (sizeBtns.length > 0) {
                if (!selectedSizeBtn) {
                    alert('กรุณาเลือกไซส์ก่อน (Please select a size)');
                    return; // หยุดทำงานถ้ายังไม่เลือก
                }
                selectedSize = selectedSizeBtn.innerText;
            }

            // 2. ดึงข้อมูลจากปุ่ม HTML (ที่คุณพิมพ์ data-* ไว้)
            const productData = {
                id: this.dataset.id,           // run007
                name: this.dataset.name,       // AuraLite™ T‑Shirt
                price: parseInt(this.dataset.price), // 8790 (แปลงเป็นตัวเลข)
                image: this.dataset.image,     // ../../running/run7.webp
                color: this.dataset.color || 'Standard',
                size: selectedSize,            // ไซส์ที่เลือก
                qty: 1                         // จำนวนเริ่มต้น
            };

            // 3. ส่งข้อมูลไปเก็บใน LocalStorage (ตะกร้าสินค้า)
            addToLocalStorage(productData);
        });
    }
});

// ฟังก์ชันช่วยบันทึกข้อมูล
function addToLocalStorage(newItem) {
    // ดึงตะกร้าเดิมมาดู (ถ้าไม่มีให้สร้าง array ว่าง [])
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    // เช็คว่ามีสินค้านี้ (ID เดียวกัน + ไซส์เดียวกัน) อยู่แล้วไหม?
    const existingIndex = cart.findIndex(item => item.id === newItem.id && item.size === newItem.size);

    if (existingIndex > -1) {
        // ถ้ามีแล้ว -> แค่เพิ่มจำนวน
        cart[existingIndex].qty += 1;
    } else {
        // ถ้ายังไม่มี -> เพิ่มสินค้าใหม่ต่อท้าย
        cart.push(newItem);
    }

    // บันทึกกลับลงไปในเครื่อง
    localStorage.setItem('myCart', JSON.stringify(cart));
    
    // แจ้งเตือนลูกค้า
    alert(`เพิ่ม "${newItem.name}" (${newItem.size}) ลงตะกร้าเรียบร้อย!`);
    
    // (Optional) ถ้ามีไอคอนตะกร้าบนแถบเมนู ให้ update ตัวเลขทันที
    updateNavBadge();
}

// ฟังก์ชันอัปเดตตัวเลขแดงๆ บน Navbar
function updateNavBadge() {
    const cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    
    const badge = document.getElementById('nav-cart-count');
    if (badge) {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'block' : 'none';
    }
}

// เรียกให้ update ตัวเลขทันทีที่เข้าหน้าเว็บ
updateNavBadge();