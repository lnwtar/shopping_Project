document.addEventListener('DOMContentLoaded', () => {
    // 1. เช็ค Session
    const userSession = localStorage.getItem('user_session');
    if (!userSession) {
        window.location.href = 'login_register.html'; 
        return;
    }

    // 2. แสดงข้อมูล User (ป้องกัน Error ด้วย try-catch)
    try {
        const user = JSON.parse(userSession);
        document.getElementById('display-name').innerText = user.username || 'User';
        document.getElementById('display-email').innerText = user.email || '';
        document.getElementById('nav-username').innerText = user.username;
        if(user.username) {
            document.getElementById('avatar-initial').innerText = user.username.charAt(0).toUpperCase();
        }
        
        // เช็ค Seller
        if (user.is_seller === 1) {
            const sellerBtn = document.getElementById('seller-btn');
            if(sellerBtn) sellerBtn.style.display = 'flex';
            const roleEl = document.getElementById('display-role');
            if(roleEl) {
                roleEl.innerText = 'SELLER';
                roleEl.style.background = '#ffd700';
                roleEl.style.color = '#000';
            }
        }
    } catch (e) {
        console.error("Profile Data Error:", e);
    }

    // 3. จัดการปุ่ม Logout (แบบ Event Listener)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // กันไม่ให้ทำงานซ้ำซ้อน
            
            if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
                localStorage.removeItem('user_session');
                localStorage.removeItem('user_id');
                // localStorage.removeItem('myCart'); // ถ้าต้องการล้างตะกร้า
                
                alert('ออกจากระบบเรียบร้อย');
                window.location.href = 'login_register.html';
            }
        });
    }
});