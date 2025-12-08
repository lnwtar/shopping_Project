document.addEventListener('DOMContentLoaded', () => {
    // 1. ดึง Order ID จาก URL Params (เช่น ?orderId=123)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    // ถ้ามี Order ID ให้แสดงผล
    if (orderId) {
        // เติมเลข 0 ด้านหน้าให้ครบ 6 หลัก (เช่น 1 -> 000001)
        document.getElementById('display-order-id').innerText = '#ORD-' + orderId.padStart(6, '0');
    }

    // 2. ดึงข้อมูล Email จาก LocalStorage (Session ของผู้ใช้)
    const userSession = localStorage.getItem('user_session');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            if (user.email) {
                document.getElementById('display-email').innerText = user.email;
            }
        } catch (e) {
            console.error("Error parsing user session:", e);
        }
    }
});