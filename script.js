
// รับ Element ของ Carousel ด้วย ID
const myCarousel = document.getElementById('carouselExampleAutoplaying');

// สร้าง Object Carousel ของ Bootstrap
const carousel = new bootstrap.Carousel(myCarousel, {
    // ตั้งค่า Interval (หน่วงเวลา) ในการเลื่อนอัตโนมัติ
    // ค่านี้คือหน่วยมิลลิวินาที (ms). 5000ms = 5 วินาที
    // ถ้าคุณต้องการให้เลื่อนเร็วขึ้น เช่น ทุก 3 วินาที ให้เปลี่ยนเป็น 3000
    interval: 5000,

    // ตั้งค่าให้เลื่อนวนซ้ำหรือไม่ (true คือวนซ้ำเรื่อยๆ)
    wrap: true
});

/*
 * *** ส่วนเสริม: หยุดการเลื่อนเมื่อผู้ใช้ชี้เมาส์ (Hover) ***
 * ส่วนนี้จะช่วยให้ผู้ใช้มีเวลาอ่านข้อความบน Banner ก่อนที่จะเลื่อนไป
 */
myCarousel.addEventListener('mouseenter', function () {
    carousel.pause(); // สั่งให้หยุดเลื่อน
});

myCarousel.addEventListener('mouseleave', function () {
    carousel.cycle(); // สั่งให้กลับมาเลื่อนอัตโนมัติ
});

// สลับฟอร์ม Login/Register
function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleBg = document.getElementById('toggle-bg');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');

  if (tab === 'login') {
    // แสดงฟอร์ม Login
    loginForm.classList.add('active-form');
    loginForm.classList.remove('hidden-form');
    registerForm.classList.add('hidden-form');
    registerForm.classList.remove('active-form');

    // ปรับ toggle bar
    toggleBg.style.transform = 'translateX(0%)';
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
  } else {
    // แสดงฟอร์ม Register
    registerForm.classList.add('active-form');
    registerForm.classList.remove('hidden-form');
    loginForm.classList.add('hidden-form');
    loginForm.classList.remove('active-form');

    // ปรับ toggle bar
    toggleBg.style.transform = 'translateX(100%)';
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
  }
}
                                       // ระบบตรวจรหัส ล็อกอิน
// ฟังก์ชันสลับฟอร์ม
function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleBg = document.getElementById('toggle-bg');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');

  if (tab === 'login') {
    loginForm.classList.add('active-form');
    loginForm.classList.remove('hidden-form');
    registerForm.classList.add('hidden-form');
    registerForm.classList.remove('active-form');

    toggleBg.style.transform = 'translateX(0%)';
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
  } else {
    registerForm.classList.add('active-form');
    registerForm.classList.remove('hidden-form');
    loginForm.classList.add('hidden-form');
    loginForm.classList.remove('active-form');

    toggleBg.style.transform = 'translateX(100%)';
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
  }
}

// ฟังก์ชัน Login
function handleLogin(e) {
  e.preventDefault();
  showToast('WELCOME BACK', 'เข้าสู่ระบบสำเร็จ');
}

// ฟังก์ชัน Register
function handleRegister(e) {
  e.preventDefault();
  const pass = document.getElementById('reg-pass').value;
  const confirmPass = document.getElementById('reg-confirm-pass').value;

  if (pass !== confirmPass) {
    alert('รหัสผ่านไม่ตรงกัน');
    return;
  }
  showToast('REGISTERED', 'สมัครสมาชิกสำเร็จ');
  switchTab('login'); // กลับไปหน้า Login หลังสมัครเสร็จ
}

// Toast แจ้งเตือน
function showToast(title, message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-title').innerText = title;
  document.getElementById('toast-message').innerText = message;

  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}
