// URL Backend: แก้ไขให้ตรงกับ Express Server ของคุณ (เช่น http://localhost:3000)
const API_BASE_URL = 'http://localhost:3000';

// =========================
// ฟังก์ชันสลับฟอร์ม Login/Register
// =========================
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleBg = document.getElementById('toggle-bg');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');

    if (tab === 'login') {
        loginForm?.classList.add('active-form');
        loginForm?.classList.remove('hidden-form');
        registerForm?.classList.add('hidden-form');
        registerForm?.classList.remove('active-form');

        if (toggleBg) toggleBg.style.transform = 'translateX(0%)';
        if (btnLogin) btnLogin.classList.add('active');
        if (btnRegister) btnRegister.classList.remove('active');
    } else {
        registerForm?.classList.add('active-form');
        registerForm?.classList.remove('hidden-form');
        loginForm?.classList.add('hidden-form');
        loginForm?.classList.remove('active-form');

        if (toggleBg) toggleBg.style.transform = 'translateX(100%)';
        if (btnRegister) btnRegister.classList.add('active');
        if (btnLogin) btnLogin.classList.remove('active');
    }
}
window.switchTab = switchTab; // ทำให้ฟังก์ชันถูกเรียกจาก HTML ได้

// =========================
// ฟังก์ชัน Toast แจ้งเตือน (ใช้แทน alert)
// =========================
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastTitle || !toastMessage) {
        alert(`${title}: ${message}`); // ใช้ alert ถ้าไม่มี Toast UI
        return;
    }
    
    toastTitle.innerText = title;
    toastMessage.innerText = message;

    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// =========================
// ฟังก์ชัน Login เชื่อมกับ API จริง
// =========================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) { // Status Code 200-299
            // ตรวจสอบว่า Backend ส่ง user object มาหรือไม่
            if (data.user && data.user.id) {
                
                showToast('WELCOME BACK', 'เข้าสู่ระบบสำเร็จ');
                
                // *** [จุดสำคัญที่แก้ไข] บันทึก Session ผู้ใช้ ***
                // บันทึก user object ทั้งหมด
                localStorage.setItem('user_session', JSON.stringify(data.user)); 
                // บันทึก ID แยกต่างหาก (ใช้สำหรับ API ตะกร้า)
                localStorage.setItem('user_id', data.user.id); 
                
                // [Optional]: ถ้า Backend ส่ง Token มาด้วย
                if (data.token) localStorage.setItem('auth_token', data.token); 

                setTimeout(() => {
                    // Redirect ไปหน้า Main (ต้องแก้ Path ให้ถูกต้องถ้าไฟล์ไม่ได้อยู่ที่ Root)
                    window.location.href = 'main.html'; 
                }, 1500);

            } else {
                 showToast('ERROR', 'Backend ไม่ได้ส่งข้อมูลผู้ใช้กลับมา');
            }

        } else { // Status Code 4xx หรือ 5xx (เกิด error)
            const errorMessage = data.error || data.message || 'รหัสผ่านหรืออีเมลไม่ถูกต้อง';
            showToast('ERROR', errorMessage);
        }
    } catch (err) {
        console.error("Login Fetch Error:", err);
        showToast('ERROR', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
}
// ต้องทำให้ฟังก์ชันเรียกได้จาก HTML
document.getElementById('login-form')?.addEventListener('submit', handleLogin);


// =========================
// ฟังก์ชัน Register เชื่อมกับ API จริง
// =========================
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;

    if (password !== confirmPass) {
        showToast('ERROR', 'รหัสผ่านไม่ตรงกัน');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showToast('REGISTERED', 'สมัครสมาชิกสำเร็จ');
            switchTab('login'); // กลับไปหน้า Login หลังสมัครเสร็จ
            
            // เติมอีเมลที่เพิ่งสมัครลงในช่อง Login
            document.getElementById('login-email').value = email; 
            
        } else {
            const errorMessage = data.error || data.message || 'สมัครสมาชิกไม่สำเร็จ';
            showToast('ERROR', errorMessage);
        }
    } catch (err) {
        console.error("Register Fetch Error:", err);
        showToast('ERROR', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
}
document.getElementById('register-form')?.addEventListener('submit', handleRegister);
