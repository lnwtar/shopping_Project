document.addEventListener("DOMContentLoaded", function () {
    // 1. ค้นหาปุ่มไซส์ทั้งหมด
    const sizeButtons = document.querySelectorAll('.size-btn');

    // 2. วนลูปเพื่อใส่คำสั่งให้ทุกปุ่ม
    sizeButtons.forEach(button => {
        button.addEventListener('click', function () {

            // 3. ลบ class 'selected' ออกจากทุกปุ่มก่อน (เพื่อให้ปุ่มเก่ากลับเป็นสีขาว)
            sizeButtons.forEach(btn => btn.classList.remove('selected'));

            // 4. ใส่ class 'selected' ให้ปุ่มที่เพิ่งถูกกด (เพื่อให้เป็นสีดำ)
            this.classList.add('selected');
        });
    });
});