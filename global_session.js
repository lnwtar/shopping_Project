document.addEventListener('DOMContentLoaded', updateNavbarUI);

// ฟังก์ชันตรวจสอบและอัปเดต Navbar
function updateNavbarUI() {
    const userSession = localStorage.getItem('user_session');
    const userLinkEl = document.getElementById('user-link');
    const userIconEl = document.getElementById('user-icon');
    const userNameSpan = document.getElementById('user-name');
    const cartIconLink = document.getElementById('cart-link'); // สมมติว่ามี ID นี้ที่ปุ่มตะกร้า

    if (userSession) {
        // [A] กรณีล็อกอินแล้ว
        try {
            const user = JSON.parse(userSession);
            
            // 1. เปลี่ยน Link และ Icon
            if (userLinkEl) {
                userLinkEl.href = "profile.html"; // พาไปหน้าโปรไฟล์
            }
            if (userNameSpan) {
                userNameSpan.innerText = user.username;
                userNameSpan.style.display = 'inline-block';
            }
            if (userIconEl) {
                // ซ่อนรูป User เดิม และแสดงชื่อ
                userIconEl.style.display = 'none'; 
            }
            
            // 2. [สำคัญ] อัปเดตตัวเลขตะกร้า
            updateCartBadge(user.id);
            
        } catch (e) {
            console.error("Error parsing user session:", e);
        }
    } else {
        // [B] กรณีไม่ได้ล็อกอิน
        if (userLinkEl) {
            userLinkEl.href = "login_register.html"; // พาไปหน้า Login
        }
        if (userNameSpan) {
            userNameSpan.style.display = 'none';
        }
        if (userIconEl) {
            userIconEl.style.display = 'inline';
        }
        updateCartBadge(null); // ตะกร้าว่างเปล่าหรือเป็น Guest
    }
}

// ฟังก์ชันอัปเดตตัวเลขตะกร้า (ต้องมีใน Global Scope)
function updateCartBadge(userId) {
    // ในตัวอย่างนี้ เราจะใช้ localStorage ธรรมดาเพราะ Backend ไม่ได้ถูกรันตลอดเวลา
    const cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    // ถ้าคุณใช้ Node.js/API จริงๆ ควรเรียก fetch(`${API_URL}/cart/count?userId=${userId}`)
    
    const badge = document.getElementById('nav-cart-count');
    if (badge) {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'block' : 'none';
    }
}