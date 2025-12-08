document.addEventListener('DOMContentLoaded', updateNavbarUI);

// ฟังก์ชันตรวจสอบและอัปเดต Navbar
function updateNavbarUI() {
    const userSession = localStorage.getItem('user_session');
    const userLinkEl = document.getElementById('user-link');
    const userIconEl = document.getElementById('user-icon');
    const userNameSpan = document.getElementById('user-name');
    // const cartIconLink = document.getElementById('cart-link'); // ไม่ได้ใช้ในการอัปเดต UI

    if (userSession) {
        // [A] กรณีล็อกอินแล้ว
        try {
            const user = JSON.parse(userSession);
            
            // 1. เปลี่ยน Link และ Icon
            if (userLinkEl) {
                userLinkEl.href = "profile.html"; // พาไปหน้าโปรไฟล์
                // [เพิ่ม] เพิ่ม onclick สำหรับ Logout ที่ปุ่ม User Link (ถ้าไม่มีปุ่ม Logout แยก)
                userLinkEl.onclick = function() {
                    // ถ้าคลิกไปหน้า Profile ปกติ
                    if (userLinkEl.href.includes("profile.html")) return true;
                };
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
            // ล้าง onclick ที่อาจค้างอยู่
            userLinkEl.onclick = null;
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

// ฟังก์ชัน Logout (ต้องเรียกจากปุ่ม Logout ในหน้า Profile หรือใน Navbar)
function handleLogout() {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
        // 1. ลบ Session ทั้งหมด
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_id');
        localStorage.removeItem('auth_token'); // ถ้าใช้ token
        
        // 2. พาไปยังหน้า Login หรือหน้าหลัก
        window.location.href = 'login_register.html'; 
    }
}
window.handleLogout = handleLogout; // ทำให้สามารถเรียกจาก HTML (onclick) ได้

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