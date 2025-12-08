document.addEventListener('DOMContentLoaded', () => {
    
    // --- ส่วนที่ 1: ระบบเลือกไซส์ ---
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // --- ส่วนที่ 2: เมื่อกดปุ่ม Add to Bag ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            
            // 1. ตรวจสอบไซส์
            const selectedSizeBtn = document.querySelector('.size-btn.selected');
            let selectedSize = 'Free Size';

            if (sizeBtns.length > 0) {
                if (!selectedSizeBtn) {
                    alert('กรุณาเลือกไซส์ก่อน (Please select a size)');
                    return; 
                }
                selectedSize = selectedSizeBtn.innerText;
            }

            // 2. ดึงข้อมูล
            const productData = {
                id: this.dataset.id,           
                name: this.dataset.name,       
                price: parseInt(this.dataset.price), 
                image: this.dataset.image,     
                color: this.dataset.color || 'Standard',
                size: selectedSize,            
                qty: 1                         
            };

            // 3. ส่งไปบันทึกและเปลี่ยนหน้า
            addToLocalStorage(productData);
        });
    }
});

// ฟังก์ชันช่วยบันทึกข้อมูล
function addToLocalStorage(newItem) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    const existingIndex = cart.findIndex(item => item.id === newItem.id && item.size === newItem.size);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push(newItem);
    }

    localStorage.setItem('myCart', JSON.stringify(cart));
    
    // --- [จุดสำคัญที่แก้ไข] ถามเพื่อเปลี่ยนหน้า ---
    // ใช้ confirm เพื่อถามผู้ใช้
    if(confirm(`เพิ่ม "${newItem.name}" ลงตะกร้าเรียบร้อย!\nต้องการไปที่หน้าตะกร้าสินค้าเพื่อชำระเงินเลยหรือไม่?`)) {
        
        // สั่งเปลี่ยนหน้าไปยัง cart.html
        // *** หมายเหตุ: ต้องแก้ Path ให้ตรงกับที่อยู่ไฟล์จริงของคุณ ***
        // ถ้าหน้าสินค้าอยู่ลึก 2 ชั้น (เช่น pagethaitanium/thaishirt1/) และ cart อยู่ใน public/cart/
        window.location.href = '../../cart.html'; 
        
    } else {
        // ถ้ากด Cancel (เลือกซื้อต่อ) ก็แค่อัปเดตตัวเลข
        updateNavBadge();
    }
}

// ฟังก์ชันอัปเดตตัวเลขบน Navbar
function updateNavBadge() {
    const cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    
    const badge = document.getElementById('nav-cart-count');
    if (badge) {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'block' : 'none';
    }
}

// เรียก update ทันทีที่โหลด
updateNavBadge();