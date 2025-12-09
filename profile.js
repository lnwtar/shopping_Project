document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบว่ามีข้อมูลการล็อกอินหรือไม่
    const userSession = localStorage.getItem('user_session');

    // ถ้าไม่มีข้อมูล (ยังไม่ล็อกอิน) ให้ดีดกลับไปหน้า Login
    if (!userSession) {
        // ถอยกลับไปหน้า login_register.html (ปรับ path ตามโครงสร้างจริงของคุณ)
        window.location.href = 'login_register.html'; 
        return;
    }

    // 2. แปลงข้อมูลจาก JSON เป็น Object
    let user;
    try {
        user = JSON.parse(userSession);
    } catch (e) {
        console.error("Session Error:", e);
        localStorage.clear(); // ล้างข้อมูลที่เสีย
        window.location.href = 'login_register.html';
        return;
    }

    // 3. แสดงผลข้อมูลผู้ใช้ในส่วน Sidebar
    // ชื่อผู้ใช้
    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.innerText = user.username || 'User';

    // อีเมล
    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.innerText = user.email || 'No Email';

    // รูป Avatar (ตัวอักษรแรกของชื่อ)
    if (user.username) {
        const avatarEl = document.getElementById('avatar-initial');
        if (avatarEl) {
            avatarEl.innerText = user.username.charAt(0).toUpperCase();
        }
    }

    // 4. ตรวจสอบสถานะผู้ขาย (Seller)
    if (user.is_seller === 1) {
        // แสดงปุ่ม Seller Dashboard
        const sellerBtn = document.getElementById('seller-btn');
        if (sellerBtn) {
            sellerBtn.style.display = 'flex';
        }

        // เปลี่ยนป้ายสถานะเป็น Seller
        const roleEl = document.getElementById('display-role');
        if (roleEl) {
            roleEl.innerText = 'SELLER / ADMIN';
            roleEl.style.background = '#ffd700'; // สีทอง
            roleEl.style.color = '#000';
        }
    }
    
    // (เสริม) โหลดประวัติการสั่งซื้อ (ถ้ามีฟังก์ชันนี้)
    // loadOrderHistory();
});