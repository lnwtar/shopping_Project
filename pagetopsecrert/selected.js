/* ไฟล์ script.js */

// บรรทัดนี้ใช้ทดสอบ: ถ้าเชื่อมติด เปิดเว็บมาจะมีข้อความเด้งขึ้นมา
console.log("เชื่อมต่อไฟล์ JS สำเร็จแล้ว!");

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. หาปุ่ม
    const buttons = document.querySelectorAll('.size-btn');

    // ถ้าไม่เจอปุ่ม ให้แจ้งเตือนใน Console
    if(buttons.length === 0) {
        console.error("ไม่เจอปุ่ม .size-btn เลย! ตรวจสอบ HTML อีกที");
        return;
    }

    // 2. สั่งงาน
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // ลบสีเก่า
            buttons.forEach(function(b) {
                b.classList.remove('selected');
            });
            // ใส่สีใหม่
            this.classList.add('selected');
        });
    });
});