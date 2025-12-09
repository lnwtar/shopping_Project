// ทำงานทันทีที่เปิดหน้าเว็บใดๆ ก็ตาม
document.addEventListener('DOMContentLoaded', () => {
    updateUserInterface();
});

function updateUserInterface() {
    // 1. ตรวจสอบตรายาง (Session)
    const userSession = localStorage.getItem('user_session');
    
    // 2. หาปุ่มรูปคนใน Navbar (ต้องตั้ง ID ให้ตรงกันใน HTML)
    const userLink = document.getElementById('user-link'); // ลิงก์ครอบรูป
    const userNameDisplay = document.getElementById('user-name-display'); // ที่สำหรับโชว์ชื่อ (ถ้ามี)

    if (userSession) {
        // --- กรณี: ล็อกอินอยู่ ---
        try {
            const user = JSON.parse(userSession);
            
            // เปลี่ยนลิงก์ให้ไปหน้า Profile แทน
            if (userLink) {
                userLink.href = 'profile.html'; 
                // เพิ่ม Tooltip บอกชื่อ
                userLink.title = `สวัสดีคุณ ${user.username}`;
            }

            // ถ้ามีที่ให้โชว์ชื่อ ก็ใส่ชื่อลงไป
            if (userNameDisplay) {
                userNameDisplay.innerText = user.username;
                userNameDisplay.style.display = 'inline';
            }

            // อัปเดตตัวเลขตะกร้า (ถ้ามีฟังก์ชันนี้)
            // updateCartBadge(); 

        } catch (e) {
            console.error("Session Error:", e);
            // ถ้าข้อมูลพัง ให้ Logout อัตโนมัติ
            handleLogout(); 
        }
    } else {
        // --- กรณี: ยังไม่ล็อกอิน ---
        if (userLink) {
            userLink.href = 'login_register.html';
            userLink.title = 'เข้าสู่ระบบ / สมัครสมาชิก';
        }
        if (userNameDisplay) {
            userNameDisplay.style.display = 'none';
        }
    }
}

// --- ฟังก์ชันออกจากระบบ (Logout) ---
// เรียกใช้โดย: onclick="handleLogout()" ที่ปุ่มในหน้า Profile
window.handleLogout = function() {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
        // 1. ลบข้อมูลทั้งหมดในเครื่อง
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_id');
        // localStorage.removeItem('myCart'); // (เลือกได้ว่าจะลบตะกร้าด้วยไหม)

        // 2. แจ้งเตือน
        alert('ออกจากระบบเรียบร้อย');

        // 3. ดีดกลับไปหน้า Login หรือหน้าแรก
        window.location.href = 'login_register.html'; 
    }
};