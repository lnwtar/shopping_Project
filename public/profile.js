const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. เช็ค Login
    const userSession = localStorage.getItem('user_session');
    if (!userSession) {
        window.location.href = 'login_register.html'; 
        return;
    }

    try {
        const user = JSON.parse(userSession);
        
        // แสดงชื่อและอีเมล
        document.getElementById('profile-name').innerText = user.username || 'User';
        document.getElementById('profile-email').innerText = user.email || '';
        
        const navUsername = document.getElementById('nav-username');
        if (navUsername) navUsername.innerText = user.username;
        
        if(user.username) {
            document.getElementById('avatar-initial').innerText = user.username.charAt(0).toUpperCase();
        }

       const sellerBtn = document.getElementById('seller-btn');
    if (sellerBtn) {
        sellerBtn.style.display = 'flex'; // แสดงปุ่มให้ทุกคนเห็น
        
        // เปลี่ยนข้อความให้ดู Friendly
        sellerBtn.innerHTML = '<i class="fas fa-store"></i> จัดการร้านค้า / ลงขายสินค้า';
    }
        
        // [สำคัญ] เรียกฟังก์ชันโหลดประวัติการสั่งซื้อ
        loadOrderHistory(user.id);

    } catch (e) {
        console.error("Profile Error:", e);
    }
});

// --- ฟังก์ชันโหลดประวัติ ---
async function loadOrderHistory(userId) {
    const tableBody = document.getElementById('orders-list');
    
    // ใส่ Loading ระหว่างรอ
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">กำลังโหลดข้อมูล...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/orders/history/${userId}`);
        const orders = await response.json();

        if (orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#888;">ยังไม่มีประวัติการสั่งซื้อ</td></tr>`;
            return;
        }

        tableBody.innerHTML = ''; // เคลียร์ Loading

        orders.forEach(order => {
            // จัดรูปแบบวันที่
            const dateObj = new Date(order.created_at);
            const dateStr = dateObj.toLocaleDateString('th-TH') + ' ' + dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

            // เลือกสีป้ายสถานะ
            let statusClass = 'status-pending';
            if (order.status === 'completed') statusClass = 'status-completed';
            if (order.status === 'cancelled') statusClass = 'status-cancelled';

            const row = `
                <tr>
                    <td style="font-weight:bold;">#ORD-${order.id}</td>
                    <td>${dateStr}</td>
                    <td><span class="status-badge ${statusClass}">${order.status.toUpperCase()}</span></td>
                    <td style="font-weight:bold;">฿${parseFloat(order.total).toLocaleString()}</td>
                    <td>
                        <button class="view-btn" onclick="alert('ดูรายละเอียดออเดอร์ #${order.id}')">View</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
    }
}

// ปุ่ม Logout (แบบใส่ onclick ใน HTML ก็ได้ หรือแบบนี้ก็ได้)
window.handleLogout = function() {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_id');
        window.location.href = 'login_register.html';
    }
};