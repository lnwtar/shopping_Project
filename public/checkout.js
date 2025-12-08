function checkAuthAndLoad() {
    // ตรวจสอบว่ามี User ID ใน LocalStorage ไหม
    const userId = localStorage.getItem('user_id');
    const userSession = localStorage.getItem('user_session');

    // ถ้าไม่มี User ID หรือ Session ให้เด้งกลับไปหน้า Login
    if (!userId || !userSession) {
        // [ทางเลือก]: ถ้าคุณต้องการความปลอดภัยสูงมาก ควรให้ Backend เป็นคนเช็ค Token อีกครั้ง
        alert('กรุณาเข้าสู่ระบบเพื่อดูข้อมูลคำสั่งซื้อ');
        window.location.href = '../../login_register.html'; // Path ไปหน้า Login
        return;
    }

    // 1. ดึง Order ID จาก URL Params (เช่น ?orderId=123)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    // ถ้ามี Order ID ให้แสดงผล
    if (orderId) {
        // เติมเลข 0 ด้านหน้าให้ครบ 6 หลัก (เช่น 1 -> 000001)
        document.getElementById('display-order-id').innerText = '#ORD-' + orderId.padStart(6, '0');
        
        // [เพิ่ม]: ในการใช้งานจริง คุณควรเรียก API ไปเช็คกับ Backend ตรงนี้ด้วยว่า
        // "Order ID นี้ เป็นของ User ID ที่ล็อกอินอยู่จริงไหม" (ป้องกัน User A ดู Order ของ User B)
        // checkOrderOwnership(orderId, userId);
    } else {
        // ถ้าไม่มี Order ID ใน URL แสดงว่าเข้าผิดหน้า
        document.getElementById('display-order-id').innerText = '#ERROR';
        document.querySelector('.thank-you-text').innerText = 'Order Not Found';
    }

    // 2. ดึงข้อมูล Email จาก LocalStorage (Session ของผู้ใช้)
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
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoad();
});