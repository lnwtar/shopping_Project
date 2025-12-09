const API_AUTH = 'http://localhost:3000'; // URL Backend

document.addEventListener('DOMContentLoaded', () => {
    injectModalHTML();
    setupModalEvents();
});

// 1. สร้าง HTML ของ Modal และยัดใส่ body
function injectModalHTML() {
    const modalHTML = `
    <div id="auth-modal" class="modal-overlay">
        <div class="modal-container">
            <button class="close-modal-btn" onclick="closeModal()">&times;</button>
            
            <!-- Login View -->
            <div id="view-login">
                <h2 class="modal-title">Welcome Back</h2>
                <form id="modal-login-form">
                    <div class="modal-form-group">
                        <input type="email" id="m-login-email" class="modal-input" placeholder="Email Address" required>
                    </div>
                    <div class="modal-form-group">
                        <input type="password" id="m-login-pass" class="modal-input" placeholder="Password" required>
                    </div>
                    <button type="submit" class="modal-btn">SIGN IN</button>
                </form>
                <div class="form-switcher">
                    <span>ยังไม่มีบัญชี?</span>
                    <span class="switch-link" onclick="switchModalView('register')">สมัครสมาชิก</span>
                </div>
            </div>

            <!-- Register View -->
            <div id="view-register" class="hidden-view">
                <h2 class="modal-title">Create Account</h2>
                <form id="modal-register-form">
                    <div class="modal-form-group">
                        <input type="text" id="m-reg-name" class="modal-input" placeholder="Full Name" required>
                    </div>
                    <div class="modal-form-group">
                        <input type="email" id="m-reg-email" class="modal-input" placeholder="Email Address" required>
                    </div>
                    <div class="modal-form-group">
                        <input type="password" id="m-reg-pass" class="modal-input" placeholder="Password (Min 6 chars)" required>
                    </div>
                    <button type="submit" class="modal-btn">REGISTER</button>
                </form>
                <div class="form-switcher">
                    <span>มีบัญชีอยู่แล้ว?</span>
                    <span class="switch-link" onclick="switchModalView('login')">เข้าสู่ระบบ</span>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 2. ตั้งค่า Event Listeners
function setupModalEvents() {
    const userLink = document.getElementById('user-link');
    
    // ดักจับการคลิกปุ่ม User ใน Navbar
    if (userLink) {
        userLink.addEventListener('click', (e) => {
            const userSession = localStorage.getItem('user_session');
            // ถ้ายังไม่ล็อกอิน ให้เปิด Modal แทนการไปหน้า Login
            if (!userSession) {
                e.preventDefault(); 
                openModal();
            }
            // ถ้าล็อกอินแล้ว ปล่อยให้ไปหน้า Profile ตามปกติ (global_session.js จะจัดการ href)
        });
    }

    // จัดการ Submit Login
    document.getElementById('modal-login-form').addEventListener('submit', handleModalLogin);
    // จัดการ Submit Register
    document.getElementById('modal-register-form').addEventListener('submit', handleModalRegister);
    
    // ปิดเมื่อคลิกพื้นหลัง
    document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') closeModal();
    });
}

// --- Functions เปิด/ปิด/สลับ ---
window.openModal = function() {
    document.getElementById('auth-modal').classList.add('show');
}

window.closeModal = function() {
    document.getElementById('auth-modal').classList.remove('show');
}

window.switchModalView = function(view) {
    if (view === 'register') {
        document.getElementById('view-login').classList.add('hidden-view');
        document.getElementById('view-register').classList.remove('hidden-view');
    } else {
        document.getElementById('view-register').classList.add('hidden-view');
        document.getElementById('view-login').classList.remove('hidden-view');
    }
}

// --- API Handlers ---
async function handleModalLogin(e) {
    e.preventDefault();
    const email = document.getElementById('m-login-email').value;
    const password = document.getElementById('m-login-pass').value;

    try {
        const res = await fetch(`${API_AUTH}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            // บันทึก Session
            localStorage.setItem('user_session', JSON.stringify(data.user));
            localStorage.setItem('user_id', data.user.id);
            
            alert('ยินดีต้อนรับ ' + data.user.username);
            closeModal();
            
            // รีโหลดหน้าเว็บเพื่อให้ UI (Navbar/Cart) อัปเดตทันที
            window.location.reload(); 
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Cannot connect to server');
    }
}

async function handleModalRegister(e) {
    e.preventDefault();
    const username = document.getElementById('m-reg-name').value;
    const email = document.getElementById('m-reg-email').value;
    const password = document.getElementById('m-reg-pass').value;

    try {
        const res = await fetch(`${API_AUTH}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();

        if (res.ok) {
            alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
            switchModalView('login');
            // Auto fill email
            document.getElementById('m-login-email').value = email;
        } else {
            alert(data.error || 'Register failed');
        }
    } catch (err) {
        alert('Cannot connect to server');
    }
}

<link rel="stylesheet" href="../../login_modal.css"></link>